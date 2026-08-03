using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Public service satisfaction evaluation: kiosk submission (no login required),
/// aggregated statistics for the admin dashboard and per-target stats for detail pages.
/// </summary>
[ApiController]
[Route("api/evaluations")]
public sealed class EvaluationsController(
    IEvaluationService service,
    IEvaluationReportExporter exporter,
    IActivityLogService logs) : ControllerBase
{
    /// <summary>
    /// Submit a satisfaction evaluation from the public kiosk.
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
    /// Overall evaluation statistics (dashboard). Supports optional date filters.
    /// </summary>
    [Authorize(Roles = "MANAGER")]
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
    [Authorize(Roles = "MANAGER")]
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
    [Authorize(Roles = "MANAGER")]
    [HttpGet("intangible")]
    public async Task<IActionResult> Intangible([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        if (!ValidateDateRange(startDate, endDate, out var error)) return ApiResponse.Error(error!);
        var stats = await service.GetTypeStatsAsync("intangible", startDate, endDate);
        return ApiResponse.Success(stats);
    }

    /// <summary>
    /// Statistics for a single evaluated target (public detail pages).
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

    /// <summary>
    /// Export evaluation statistics as an Excel workbook (summary, distribution, trend, rankings).
    /// </summary>
    [Authorize(Roles = "MANAGER")]
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
    [Authorize(Roles = "MANAGER")]
    [HttpGet("export/pdf")]
    public async Task<IActionResult> ExportPdf([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        if (!ValidateDateRange(startDate, endDate, out var error)) return ApiResponse.Error(error!);
        var stats = await service.GetStatsAsync(startDate, endDate);
        var bytes = exporter.ExportPdf(stats, startDate, endDate);
        logs.Log(User, "EXPORT", "Evaluations", null, "PDF report");
        return File(bytes, "application/pdf", $"evaluation-statistics-{DateTime.UtcNow:yyyyMMdd-HHmm}.pdf");
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
