using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;
using VanDinh.API.Services.MailMerge;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/mail-merge")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class MailMergeController(
    IMailMergeService mailMergeService,
    IActivityLogService activityLogService,
    IAppRepository repository,
    IWebHostEnvironment environment,
    ILogger<MailMergeController> log) : ControllerBase
{
    /// <summary>
    /// Uploads the Word template and Excel data file and returns the detected placeholders,
    /// Excel columns, the suggested mapping and a preview of the first rows.
    /// </summary>
    [HttpPost("analyze")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Analyze([FromForm] IFormFile template, [FromForm] IFormFile excel, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mailMergeService.AnalyzeAsync(template, excel, cancellationToken);
            return ApiResponse.Success(result, "Template and data file analyzed successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Mail merge analysis failed");
            return ApiResponse.Error("Failed to analyze the uploaded files.");
        }
    }

    /// <summary>
    /// Queues a generation job: one personalized Word document per Excel row, packaged
    /// into a ZIP. The job runs in the background; poll GET /api/mail-merge/jobs/{id}
    /// for live progress.
    /// </summary>
    [HttpPost("jobs")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateJob(
        [FromForm] IFormFile template,
        [FromForm] IFormFile excel,
        [FromForm] string filenamePattern,
        [FromForm] string? mappingJson,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await mailMergeService.CreateJobAsync(
                template, excel, filenamePattern, mappingJson, User, cancellationToken);

            activityLogService.Log(
                User,
                "GenerateFormFilling",
                "MailMergeJob",
                result.JobId,
                $"Mail merge job started: {result.TemplateFileName ?? ""} → {result.RowCount} documents",
                HttpContext.GetRemoteIpAddress());
            repository.SaveChanges();

            return ApiResponse.Success(result, "Generation job started.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Failed to start mail merge job");
            return ApiResponse.Error("Failed to start the generation job.");
        }
    }

    /// <summary>Returns the live progress of a generation job.</summary>
    [HttpGet("jobs/{publicId:guid}")]
    public async Task<IActionResult> Progress(Guid publicId)
    {
        try
        {
            var result = await mailMergeService.GetProgressAsync(publicId);
            return ApiResponse.Success(result);
        }
        catch (KeyNotFoundException)
        {
            return ApiResponse.NotFound("The mail merge job was not found.");
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Failed to read mail merge progress");
            return ApiResponse.Error("Failed to read the generation progress.");
        }
    }

    /// <summary>Downloads the ZIP containing every generated Word document.</summary>
    [HttpGet("jobs/{publicId:guid}/download")]
    public async Task<IActionResult> Download(Guid publicId)
    {
        var progress = await mailMergeService.GetProgressAsync(publicId);
        if (progress.SuccessCount <= 0 || string.IsNullOrWhiteSpace(progress.ZipFileName))
        {
            return ApiResponse.Error("No generated documents are available for this job.");
        }

        var storageDir = MailMergeJobRunner.GetStorageDirectory(environment);
        var zipPath = Path.GetFullPath(Path.Combine(storageDir, progress.ZipFileName));
        if (!zipPath.StartsWith(Path.GetFullPath(storageDir), StringComparison.OrdinalIgnoreCase) || !System.IO.File.Exists(zipPath))
        {
            return ApiResponse.NotFound("The generated ZIP file is no longer available.");
        }

        var downloadName = $"mail-merge-{DateTime.UtcNow:yyyyMMdd-HHmmss}.zip";
        return PhysicalFile(zipPath, "application/zip", downloadName);
    }

    /// <summary>Paged generation history.</summary>
    [HttpGet("history")]
    public async Task<IActionResult> History([FromQuery] PagedRequest request, [FromQuery] string? status)
    {
        var (page, pageSize) = request.Normalize();
        var result = await mailMergeService.GetHistoryAsync(page, pageSize, status);
        return ApiResponse.Success(result);
    }

    /// <summary>Full details of one history record, including the persisted error list.</summary>
    [HttpGet("history/{jobId:long}")]
    public async Task<IActionResult> HistoryDetail(long jobId)
    {
        var result = await mailMergeService.GetHistoryDetailAsync(jobId);
        if (result is null)
        {
            return ApiResponse.NotFound("The mail merge history record was not found.");
        }
        return ApiResponse.Success(result);
    }

    /// <summary>Deletes a history record and its generated ZIP file.</summary>
    [HttpDelete("history/{jobId:long}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteHistory(long jobId)
    {
        var (found, deleted) = await mailMergeService.DeleteJobAsync(jobId);
        if (!found)
        {
            return ApiResponse.NotFound("The mail merge history record was not found.");
        }

        activityLogService.Log(
            User,
            "DeleteFormFillingHistory",
            "MailMergeJob",
            jobId,
            $"Deleted mail merge history record (ZIP removed: {deleted})",
            HttpContext.GetRemoteIpAddress());
        repository.SaveChanges();

        return ApiResponse.Success(null, "History record deleted.");
    }
}
