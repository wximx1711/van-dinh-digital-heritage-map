using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Public service satisfaction evaluation: kiosk submission (no login required),
/// aggregated statistics for the admin dashboard, per-target stats for detail pages
/// and full moderation (search, approve, reject, reply, delete, export).
/// </summary>
[ApiController]
[Route("api/evaluations")]
public sealed class EvaluationsController(
    IEvaluationService service,
    IEvaluationReportExporter exporter,
    IActivityLogService logs) : ControllerBase
{
    /// <summary>
    /// Submit a satisfaction evaluation from the public kiosk / heritage detail page.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] EvaluationSubmitRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        try
        {
            var item = await service.SubmitAsync(request);
            return ApiResponse.Success(item, "Evaluation submitted successfully.", StatusCodes.Status201Created);
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    /// <summary>
    /// Statistics for a single evaluated target (public detail pages) — approved only.
    /// </summary>
    [HttpGet("target/{type}/{id}")]
    public async Task<IActionResult> Target(
        [FromRoute] string type,
        [FromRoute] string id,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var stats = await service.GetTargetStatsAsync(type, id, startDate, endDate, page, pageSize);
            return ApiResponse.Success(stats);
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.NotFound(ex.Message);
        }
    }

    // ── Admin statistics ──────────────────────────────────────────────

    /// <summary>
    /// Overall evaluation statistics (dashboard). Supports optional date filters.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("overall")]
    public async Task<IActionResult> Overall([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        if (!ValidateDateRange(startDate, endDate, out var error)) return ApiResponse.Error(error!);
        var stats = await service.GetStatsAsync(startDate, endDate);
        return ApiResponse.Success(stats);
    }

    /// <summary>
    /// Heritage evaluation statistics (top 10, lowest rated, trend...).
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("heritage")]
    public async Task<IActionResult> Heritage([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        if (!ValidateDateRange(startDate, endDate, out var error)) return ApiResponse.Error(error!);
        var stats = await service.GetTypeStatsAsync("heritage", startDate, endDate);
        return ApiResponse.Success(stats);
    }

    /// <summary>
    /// Intangible heritage evaluation statistics (top 10, lowest rated, trend...).
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("intangible")]
    public async Task<IActionResult> Intangible([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        if (!ValidateDateRange(startDate, endDate, out var error)) return ApiResponse.Error(error!);
        var stats = await service.GetTypeStatsAsync("intangible", startDate, endDate);
        return ApiResponse.Success(stats);
    }

    /// <summary>
    /// Moderation counters for the evaluation management page.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("admin/stats")]
    public async Task<IActionResult> AdminStats()
    {
        var stats = await service.GetAdminStatsAsync();
        return ApiResponse.Success(stats);
    }

    /// <summary>
    /// Average rating and review count per heritage/intangible item (management lists).
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("admin/heritage-summaries")]
    public async Task<IActionResult> HeritageSummaries()
    {
        var summaries = await service.GetHeritageSummariesAsync();
        return ApiResponse.Success(summaries);
    }

    // ── Admin moderation ──────────────────────────────────────────────

    /// <summary>
    /// Search / filter / sort / paginate all evaluations.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost("search")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Search([FromBody] EvaluationSearchRequest request)
    {
        var result = await service.SearchAsync(request);
        return ApiResponse.Success(result);
    }

    /// <summary>
    /// Get a single evaluation detail.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        try
        {
            var detail = await service.GetDetailAsync(id);
            return ApiResponse.Success(detail);
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Approve a pending evaluation so it appears on public pages.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost("{id:long}/approve")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Approve(long id)
    {
        try
        {
            await service.ApproveAsync(id);
            logs.Log(User, "APPROVE", "ServiceEvaluations", id);
            return ApiResponse.Success(null, "Evaluation approved.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Reject an evaluation so it never appears on public pages.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost("{id:long}/reject")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Reject(long id)
    {
        try
        {
            await service.RejectAsync(id);
            logs.Log(User, "REJECT", "ServiceEvaluations", id);
            return ApiResponse.Success(null, "Evaluation rejected.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Reply to an evaluation (publicly visible next to the review).
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost("{id:long}/reply")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Reply(long id, [FromBody] EvaluationReplyRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }
        try
        {
            await service.ReplyAsync(id, request.AdminReply);
            logs.Log(User, "REPLY", "ServiceEvaluations", id);
            return ApiResponse.Success(null, "Reply saved.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Delete an evaluation.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("{id:long}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(long id)
    {
        try
        {
            await service.DeleteAsync(id);
            logs.Log(User, "DELETE", "ServiceEvaluations", id);
            return ApiResponse.Success(null, "Evaluation deleted.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.NotFound(ex.Message);
        }
    }

    // ── Exports ───────────────────────────────────────────────────────

    /// <summary>
    /// Export evaluation statistics as an Excel workbook (summary, distribution, trend, rankings).
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        if (!ValidateDateRange(startDate, endDate, out var error)) return ApiResponse.Error(error!);
        var stats = await service.GetStatsAsync(startDate, endDate);
        var bytes = exporter.ExportExcel(stats, startDate, endDate);
        logs.Log(User, "EXPORT", "Evaluations", null, "Excel report");
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"evaluation-statistics-{DateTime.UtcNow:yyyyMMdd-HHmm}.xlsx");
    }

    /// <summary>
    /// Export evaluation statistics as a PDF report with charts.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("export/pdf")]
    public async Task<IActionResult> ExportPdf([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        if (!ValidateDateRange(startDate, endDate, out var error)) return ApiResponse.Error(error!);
        var stats = await service.GetStatsAsync(startDate, endDate);
        var bytes = exporter.ExportPdf(stats, startDate, endDate);
        logs.Log(User, "EXPORT", "Evaluations", null, "PDF report");
        return File(bytes, "application/pdf", $"evaluation-statistics-{DateTime.UtcNow:yyyyMMdd-HHmm}.pdf");
    }

    /// <summary>
    /// Export the (filtered) evaluation list as an Excel workbook for moderation/backup.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpGet("admin/export/excel")]
    public async Task<IActionResult> ExportListExcel(
        [FromQuery] string? search,
        [FromQuery] string? targetType,
        [FromQuery] string? targetId,
        [FromQuery] int? rating,
        [FromQuery] string? satisfactionLevel,
        [FromQuery] string? status,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo)
    {
        var request = new EvaluationSearchRequest
        {
            Page = 1,
            PageSize = 500,
            Search = search,
            TargetType = targetType,
            TargetId = targetId,
            Rating = rating,
            SatisfactionLevel = satisfactionLevel,
            Status = status,
            DateFrom = dateFrom,
            DateTo = dateTo,
            SortBy = "createdAt",
            SortDirection = "desc",
        };
        var result = await service.SearchAsync(request);
        var bytes = exporter.ExportListExcel(result.Data);
        logs.Log(User, "EXPORT", "Evaluations", null, "Excel evaluation list");
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"evaluations-{DateTime.UtcNow:yyyyMMdd-HHmm}.xlsx");
    }

    private static bool ValidateDateRange(DateTime? startDate, DateTime? endDate, out string? error)
    {
        error = null;
        if (startDate.HasValue && endDate.HasValue && endDate.Value < startDate.Value)
        {
            error = "endDate must be greater than or equal to startDate.";
            return false;
        }
        return true;
    }
}
