using System.Collections.Concurrent;
using VanDinh.API.Configuration;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services.MailMerge;

/// <summary>In-memory live state of one generation job while it is being processed.</summary>
public sealed class MailMergeJobRunState
{
    public long JobId { get; init; }
    public Guid PublicId { get; init; }
    public volatile string Status = "Processing";
    public int TotalRows { get; init; }
    public int ProcessedRows;
    public int SuccessCount;
    public int FailedCount;
    public string? CurrentFileName;
    public byte[] TemplateBytes { get; init; } = [];
    public IReadOnlyList<IReadOnlyDictionary<string, string>> Rows { get; init; } = [];
    public IReadOnlyDictionary<string, string> Mapping { get; init; } = new Dictionary<string, string>();
    public string FilenamePattern { get; init; } = "";
    public ConcurrentQueue<string> Errors { get; } = new();
    public string ZipFilePath { get; init; } = "";
    public DateTime StartedAt { get; init; } = DateTime.UtcNow;
    public DateTime? CompletedAt;
    public int MaxLiveErrors { get; init; } = 200;
}

/// <summary>
/// Processes mail merge jobs in the background so the client can poll live progress
/// (processed / success / failed counts and error messages) while documents are generated.
/// </summary>
public interface IMailMergeJobRunner
{
    void Start(MailMergeJobRunState state);
    MailMergeJobRunState? Get(Guid publicId);
}

public sealed class MailMergeJobRunner(
    IServiceScopeFactory scopeFactory,
    IMailMergeDocumentGenerator documentGenerator,
    IMailMergeFileNameGenerator fileNameGenerator,
    ILogger<MailMergeJobRunner> log,
    MailMergeOptions options) : IMailMergeJobRunner
{
    private readonly ConcurrentDictionary<Guid, MailMergeJobRunState> _running = new();

    public void Start(MailMergeJobRunState state)
    {
        _running[state.PublicId] = state;
        EvictExpired();
        _ = Task.Run(() => ProcessAsync(state));
    }

    public MailMergeJobRunState? Get(Guid publicId)
        => _running.TryGetValue(publicId, out var state) ? state : null;

    private void EvictExpired()
    {
        var cutoff = DateTime.UtcNow.AddHours(-options.ZipRetentionHours);
        foreach (var (id, state) in _running)
        {
            if (state.CompletedAt is { } completed && completed < cutoff)
            {
                _running.TryRemove(id, out _);
            }
        }
    }

    private async Task ProcessAsync(MailMergeJobRunState state)
    {
        var zipPath = state.ZipFilePath;
        var usedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var allErrors = new List<string>();

        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(zipPath)!);

            using (var zipStream = File.Create(zipPath))
            using (var archive = new System.IO.Compression.ZipArchive(zipStream, System.IO.Compression.ZipArchiveMode.Create))
            {
                for (var i = 0; i < state.Rows.Count; i++)
                {
                    if (state.Status != "Processing")
                    {
                        break;
                    }

                    var row = state.Rows[i];
                    try
                    {
                        var rowNumber = i + 1;
                        var generated = fileNameGenerator.Build(state.FilenamePattern, row, rowNumber);
                        var fileName = fileNameGenerator.EnsureUnique(generated.Name, usedNames) + ".docx";
                        state.CurrentFileName = fileName;

                        // Convert the column-keyed Excel row into placeholder-keyed values
                        // using the resolved mapping.
                        var placeholderValues = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                        foreach (var (placeholder, column) in state.Mapping)
                        {
                            placeholderValues[placeholder] = row.GetValueOrDefault(column) ?? "";
                        }

                        var documentBytes = documentGenerator.Generate(state.TemplateBytes, placeholderValues);

                        var entry = archive.CreateEntry(fileName, System.IO.Compression.CompressionLevel.Optimal);
                        await using (var entryStream = entry.Open())
                        {
                            await entryStream.WriteAsync(documentBytes);
                        }

                        state.SuccessCount++;
                    }
                    catch (Exception ex)
                    {
                        state.FailedCount++;
                        var message = $"Row {i + 1}: {ex.Message}";
                        allErrors.Add(message);
                        PushError(state, message);
                    }
                    finally
                    {
                        state.ProcessedRows++;
                    }
                }
            }

            state.Status = state.FailedCount > 0 && state.SuccessCount == 0 ? "Failed" : "Completed";
            state.CompletedAt = DateTime.UtcNow;
        }
        catch (Exception ex)
        {
            state.Status = "Failed";
            state.CompletedAt = DateTime.UtcNow;
            var message = $"Generation aborted: {ex.Message}";
            allErrors.Add(message);
            PushError(state, message);
            log.LogError(ex, "Mail merge job {PublicId} failed", state.PublicId);
        }
        finally
        {
            await PersistAsync(state, allErrors);
        }
    }

    private void PushError(MailMergeJobRunState state, string message)
    {
        state.Errors.Enqueue(message);
        while (state.Errors.Count > state.MaxLiveErrors)
        {
            state.Errors.TryDequeue(out _);
        }
    }

    private async Task PersistAsync(MailMergeJobRunState state, IReadOnlyList<string> errors)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var repository = scope.ServiceProvider.GetRequiredService<IMailMergeJobRepository>();

            var job = repository.FindById(state.JobId);
            if (job is null)
            {
                return;
            }

            job.Status = state.Status;
            job.SuccessCount = state.SuccessCount;
            job.FailedCount = state.FailedCount;
            job.TotalRows = state.TotalRows;
            job.CompletedAt = state.CompletedAt;
            job.ZipFileName = $"{state.PublicId:N}.zip";
            job.ErrorsJson = SerializeErrors(errors, options.MaxStoredErrors);

            repository.Update(job);
            repository.SaveChanges();

            if (state.Status == "Failed" && state.SuccessCount == 0)
            {
                TryDeleteZip(state.ZipFilePath);
            }
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Failed to persist mail merge job {PublicId}", state.PublicId);
        }
    }

    private static string SerializeErrors(IReadOnlyList<string> errors, int maxErrors)
    {
        var capped = errors.Count <= maxErrors
            ? errors
            : errors.TakeLast(maxErrors).ToList();
        return System.Text.Json.JsonSerializer.Serialize(capped);
    }

    private static void TryDeleteZip(string zipPath)
    {
        try
        {
            if (File.Exists(zipPath))
            {
                File.Delete(zipPath);
            }
        }
        catch (Exception ex)
        {
            // Non-critical cleanup failure; the file will be removed by the retention sweeper.
            System.Diagnostics.Debug.WriteLine(ex.Message);
        }
    }

    /// <summary>Directory where generated ZIP packages are stored (outside wwwroot).</summary>
    public static string GetStorageDirectory(IWebHostEnvironment environment)
    {
        var root = environment.ContentRootPath;
        return Path.Combine(root, "App_Data", "mail-merge");
    }
}
