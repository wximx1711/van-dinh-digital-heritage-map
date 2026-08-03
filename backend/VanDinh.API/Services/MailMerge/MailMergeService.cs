using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using VanDinh.API.Configuration;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services.MailMerge;

/// <summary>
/// High-level orchestration for the Automatic Form Filling (advanced mail merge) module:
/// template/excel analysis, mapping resolution, job creation, live progress and history.
/// </summary>
public interface IMailMergeService
{
    Task<MailMergeAnalyzeResponse> AnalyzeAsync(IFormFile template, IFormFile excel, CancellationToken cancellationToken);
    Task<MailMergeJobCreatedResponse> CreateJobAsync(
        IFormFile template,
        IFormFile excel,
        string filenamePattern,
        string? mappingJson,
        ClaimsPrincipal user,
        CancellationToken cancellationToken);
    Task<MailMergeProgressResponse> GetProgressAsync(Guid publicId);
    Task<PagedResult<MailMergeHistoryItemDto>> GetHistoryAsync(int page, int pageSize, string? status);
    Task<MailMergeHistoryDetailDto?> GetHistoryDetailAsync(long jobId);
    Task<(bool Found, bool Deleted)> DeleteJobAsync(long jobId);
    void CleanupExpiredZips();
}

public sealed class MailMergeService(
    IMailMergePlaceholderExtractor placeholderExtractor,
    IExcelSheetReader excelSheetReader,
    IMailMergeJobRunner jobRunner,
    IMailMergeJobRepository repository,
    ILogger<MailMergeService> log,
    IWebHostEnvironment environment,
    MailMergeOptions options) : IMailMergeService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task<MailMergeAnalyzeResponse> AnalyzeAsync(IFormFile template, IFormFile excel, CancellationToken cancellationToken)
    {
        var templateBytes = await ReadFileAsync(template, options.MaxTemplateFileSize, ".docx", "Word template", cancellationToken);
        var excelBytes = await ReadFileAsync(excel, options.MaxExcelFileSize, ".xlsx", "Excel data file", cancellationToken);

        var placeholders = placeholderExtractor.ExtractPlaceholders(templateBytes);
        if (placeholders.Count == 0)
        {
            throw new InvalidOperationException("No {{Placeholder}} tokens were found in the Word template.");
        }

        var sheet = excelSheetReader.Read(excelBytes, options.MaxRows);

        var mapping = BuildSuggestedMapping(placeholders, sheet.Columns.Select(c => c.Name));
        var previewRows = sheet.Rows.Take(5).ToList();

        return new MailMergeAnalyzeResponse(
            template.FileName,
            placeholders,
            excel.FileName,
            sheet.Columns,
            mapping,
            previewRows,
            sheet.Rows.Count,
            sheet.EmptyRowCount);
    }

    public async Task<MailMergeJobCreatedResponse> CreateJobAsync(
        IFormFile template,
        IFormFile excel,
        string filenamePattern,
        string? mappingJson,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var templateBytes = await ReadFileAsync(template, options.MaxTemplateFileSize, ".docx", "Word template", cancellationToken);
        var excelBytes = await ReadFileAsync(excel, options.MaxExcelFileSize, ".xlsx", "Excel data file", cancellationToken);

        var placeholders = placeholderExtractor.ExtractPlaceholders(templateBytes);
        if (placeholders.Count == 0)
        {
            throw new InvalidOperationException("No {{Placeholder}} tokens were found in the Word template.");
        }

        var sheet = excelSheetReader.Read(excelBytes, options.MaxRows);
        if (sheet.Rows.Count == 0)
        {
            throw new InvalidOperationException("The Excel data file does not contain any data rows.");
        }

        var columnNames = sheet.Columns.Select(c => c.Name).ToList();
        var explicitMapping = ParseMapping(mappingJson);
        var mapping = ResolveMapping(placeholders, columnNames, explicitMapping);

        var missing = placeholders
            .Where(p => !mapping.ContainsKey(p))
            .Select(p => $"\"{p}\"")
            .ToList();
        if (missing.Count > 0)
        {
            throw new InvalidOperationException(
                $"The following placeholders have no matching Excel column: {string.Join(", ", missing)}. " +
                "Rename the template placeholders or Excel columns, or provide a manual mapping.");
        }

        var userId = long.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var username = user.Identity?.Name ?? "system";

        var job = repository.Add(new MailMergeJob
        {
            PublicId = Guid.NewGuid(),
            TemplateFileName = template.FileName,
            ExcelFileName = excel.FileName,
            FilenamePattern = string.IsNullOrWhiteSpace(filenamePattern) ? "{{Document}}" : filenamePattern,
            PlaceholdersJson = JsonSerializer.Serialize(placeholders),
            MappingJson = JsonSerializer.Serialize(mapping),
            TotalRows = sheet.Rows.Count,
            Status = "Processing",
            CreatedBy = userId,
            CreatedByUsername = username,
            CreatedAt = DateTime.UtcNow
        });
        repository.SaveChanges();

        var storageDir = MailMergeJobRunner.GetStorageDirectory(environment);
        Directory.CreateDirectory(storageDir);
        var zipPath = Path.Combine(storageDir, $"{job.PublicId:N}.zip");

        jobRunner.Start(new MailMergeJobRunState
        {
            JobId = job.JobId,
            PublicId = job.PublicId,
            TotalRows = sheet.Rows.Count,
            TemplateBytes = templateBytes,
            Rows = sheet.Rows,
            Mapping = mapping,
            FilenamePattern = job.FilenamePattern,
            ZipFilePath = zipPath,
            MaxLiveErrors = options.MaxLiveErrors
        });

        log.LogInformation("Mail merge job {JobId} queued with {RowCount} rows by {Username}", job.JobId, sheet.Rows.Count, username);

        return new MailMergeJobCreatedResponse(
            job.JobId,
            job.PublicId,
            "Processing",
            job.TemplateFileName,
            job.ExcelFileName,
            placeholders,
            columnNames,
            sheet.Rows.Count,
            job.FilenamePattern);
    }

    public async Task<MailMergeProgressResponse> GetProgressAsync(Guid publicId)
    {
        var live = jobRunner.Get(publicId);
        if (live is not null)
        {
            return new MailMergeProgressResponse(
                live.Status,
                live.TotalRows,
                live.ProcessedRows,
                live.SuccessCount,
                live.FailedCount,
                live.CurrentFileName,
                live.Errors.ToArray(),
                live.CompletedAt,
                live.SuccessCount > 0 ? $"{live.PublicId:N}.zip" : null);
        }

        var job = repository.FindByPublicId(publicId);
        if (job is null)
        {
            throw new KeyNotFoundException("The mail merge job was not found.");
        }

        var errors = DeserializeErrors(job.ErrorsJson);
        return new MailMergeProgressResponse(
            job.Status,
            job.TotalRows,
            job.SuccessCount + job.FailedCount,
            job.SuccessCount,
            job.FailedCount,
            null,
            errors,
            job.CompletedAt,
            job.SuccessCount > 0 ? job.ZipFileName : null);
    }

    public async Task<PagedResult<MailMergeHistoryItemDto>> GetHistoryAsync(int page, int pageSize, string? status)
    {
        CleanupExpiredZips();

        var result = repository.GetHistory(page, pageSize, status);
        return new PagedResult<MailMergeHistoryItemDto>(
            result.Data.Select(j => new MailMergeHistoryItemDto(
                j.JobId,
                j.PublicId,
                j.TemplateFileName,
                j.ExcelFileName,
                j.FilenamePattern,
                j.TotalRows,
                j.SuccessCount,
                j.FailedCount,
                j.Status,
                j.CreatedByUsername,
                j.CreatedAt,
                j.CompletedAt,
                j.ZipFileName)).ToList(),
            result.Page,
            result.PageSize,
            result.TotalRecords,
            result.TotalPages);
    }

    public async Task<MailMergeHistoryDetailDto?> GetHistoryDetailAsync(long jobId)
    {
        var job = repository.FindById(jobId);
        if (job is null)
        {
            return null;
        }

        return new MailMergeHistoryDetailDto(
            job.JobId,
            job.PublicId,
            job.TemplateFileName,
            job.ExcelFileName,
            job.FilenamePattern,
            DeserializeStringList(job.PlaceholdersJson),
            DeserializeMapping(job.MappingJson),
            job.TotalRows,
            job.SuccessCount,
            job.FailedCount,
            job.Status,
            job.CreatedByUsername,
            job.CreatedAt,
            job.CompletedAt,
            DeserializeErrors(job.ErrorsJson),
            job.ZipFileName);
    }

    public async Task<(bool Found, bool Deleted)> DeleteJobAsync(long jobId)
    {
        var job = repository.FindById(jobId);
        if (job is null)
        {
            return (false, false);
        }

        repository.Delete(job);
        repository.SaveChanges();

        var deleted = false;
        if (!string.IsNullOrWhiteSpace(job.ZipFileName))
        {
            var path = GetZipPath(job.ZipFileName);
            if (File.Exists(path))
            {
                try
                {
                    File.Delete(path);
                    deleted = true;
                }
                catch (Exception ex)
                {
                    log.LogWarning(ex, "Failed to delete ZIP for mail merge job {JobId}", job.JobId);
                }
            }
        }

        return (true, deleted);
    }

    public void CleanupExpiredZips()
    {
        var cutoff = DateTime.UtcNow.AddHours(-options.ZipRetentionHours);
        var storageDir = MailMergeJobRunner.GetStorageDirectory(environment);
        if (!Directory.Exists(storageDir))
        {
            return;
        }

        foreach (var file in Directory.GetFiles(storageDir, "*.zip"))
        {
            try
            {
                if (File.GetLastWriteTimeUtc(file) < cutoff)
                {
                    File.Delete(file);
                }
            }
            catch (Exception ex)
            {
                log.LogDebug(ex, "Failed to remove expired ZIP {File}", file);
            }
        }

        // Orphaned jobs that never completed are marked failed.
        foreach (var orphan in repository.FindActiveOlderThan(cutoff))
        {
            orphan.Status = "Failed";
            repository.Update(orphan);
        }
        repository.SaveChanges();
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static async Task<byte[]> ReadFileAsync(IFormFile file, long maxBytes, string allowedExtension, string label, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            throw new InvalidOperationException($"{label} file is empty.");
        }
        if (file.Length > maxBytes)
        {
            throw new InvalidOperationException($"{label} file is too large (max {maxBytes / (1024 * 1024)} MB).");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!string.Equals(extension, allowedExtension, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"{label} must be a {allowedExtension} file.");
        }

        using var stream = new MemoryStream((int)file.Length);
        await file.CopyToAsync(stream, cancellationToken);
        return stream.ToArray();
    }

    private static IReadOnlyList<MailMergeMappingSuggestionDto> BuildSuggestedMapping(
        IReadOnlyList<string> placeholders,
        IEnumerable<string> columnNames)
    {
        var columns = columnNames.ToList();
        var suggestions = new List<MailMergeMappingSuggestionDto>();

        foreach (var placeholder in placeholders)
        {
            var exact = columns.FirstOrDefault(c => string.Equals(c.Trim(), placeholder, StringComparison.OrdinalIgnoreCase));
            if (exact is not null)
            {
                suggestions.Add(new MailMergeMappingSuggestionDto(placeholder, exact, "exact"));
                continue;
            }

            var normalized = Normalize(placeholder);
            var fuzzy = columns.FirstOrDefault(c => Normalize(c) == normalized);
            if (fuzzy is not null)
            {
                suggestions.Add(new MailMergeMappingSuggestionDto(placeholder, fuzzy, "normalized"));
                continue;
            }

            suggestions.Add(new MailMergeMappingSuggestionDto(placeholder, null, "none"));
        }

        return suggestions;
    }

    /// <summary>
    /// Resolves the final placeholder → column map. Explicit user mapping wins;
    /// everything else falls back to automatic detection. Unknown columns in the explicit
    /// mapping produce a validation error.
    /// </summary>
    private static Dictionary<string, string> ResolveMapping(
        IReadOnlyList<string> placeholders,
        IReadOnlyList<string> columnNames,
        IReadOnlyList<MailMergeMappingItem>? explicitMapping)
    {
        var columnLookup = columnNames
            .ToDictionary(c => c, c => c, StringComparer.OrdinalIgnoreCase);

        var explicitByPlaceholder = explicitMapping?
            .Where(m => !string.IsNullOrWhiteSpace(m.Column))
            .ToDictionary(m => m.Placeholder, m => m.Column, StringComparer.OrdinalIgnoreCase);

        if (explicitByPlaceholder is { Count: > 0 })
        {
            var unknown = explicitByPlaceholder
                .Where(kv => !columnLookup.ContainsKey(kv.Value!))
                .Select(kv => $"\"{kv.Value}\"")
                .ToList();
            if (unknown.Count > 0)
            {
                throw new InvalidOperationException(
                    $"The following Excel columns in the mapping do not exist in the data file: {string.Join(", ", unknown)}.");
            }
        }

        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var placeholder in placeholders)
        {
            if (explicitByPlaceholder is not null && explicitByPlaceholder.TryGetValue(placeholder, out var explicitColumn))
            {
                result[placeholder] = columnLookup[explicitColumn!];
                continue;
            }

            var exact = columnNames.FirstOrDefault(c => string.Equals(c.Trim(), placeholder, StringComparison.OrdinalIgnoreCase));
            if (exact is not null)
            {
                result[placeholder] = exact;
                continue;
            }

            var normalized = Normalize(placeholder);
            var fuzzy = columnNames.FirstOrDefault(c => Normalize(c) == normalized);
            if (fuzzy is not null)
            {
                result[placeholder] = fuzzy;
            }
        }

        return result;
    }

    private static IReadOnlyList<MailMergeMappingItem>? ParseMapping(string? mappingJson)
    {
        if (string.IsNullOrWhiteSpace(mappingJson))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<List<MailMergeMappingItem>>(mappingJson, JsonOptions);
        }
        catch (JsonException)
        {
            throw new InvalidOperationException("The submitted mapping data is invalid.");
        }
    }

    private static List<string> DeserializeErrors(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static List<string> DeserializeStringList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static Dictionary<string, string> DeserializeMapping(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new Dictionary<string, string>();
        }

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new Dictionary<string, string>();
        }
        catch (JsonException)
        {
            return new Dictionary<string, string>();
        }
    }

    private string GetZipPath(string zipFileName)
    {
        var storageDir = MailMergeJobRunner.GetStorageDirectory(environment);
        var fullPath = Path.GetFullPath(Path.Combine(storageDir, zipFileName));
        if (!fullPath.StartsWith(Path.GetFullPath(storageDir), StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid ZIP file reference.");
        }
        return fullPath;
    }

    /// <summary>Normalizes a name for fuzzy matching: lowercase, no diacritics, no separators.</summary>
    private static string Normalize(string value)
    {
        var stripped = RemoveDiacritics(value ?? "");
        return Regex.Replace(stripped.ToLowerInvariant(), @"[\s_\-\.]", "");
    }

    private static string RemoveDiacritics(string value)
    {
        return string.Concat(
            value.Normalize(System.Text.NormalizationForm.FormD)
                .Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark))
            .Normalize(System.Text.NormalizationForm.FormC);
    }
}
