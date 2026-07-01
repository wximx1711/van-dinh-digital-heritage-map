using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Provides access to monthly update statistics used in dashboard charts.
/// </summary>
[ApiController]
[Route("api/monthly-updates")]
public sealed class MonthlyUpdatesController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    /// <summary>
    /// Get all monthly update statistics.
    /// </summary>
    [HttpGet]
    public IActionResult GetAll() => ApiResponse.Success(repository.MonthlyUpdates.Select(x => x.ToDto()).ToList());

    /// <summary>
    /// Create a new monthly update entry.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(MonthlyUpdateRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var item = new MonthlyUpdate
        {
            MonthLabel = request.MonthLabel,
            DisplayVi = request.DisplayVi,
            DisplayEn = request.DisplayEn,
            UpdateCount = request.UpdateCount
        };
        repository.AddMonthlyUpdate(item);
        logs.Log(User, "CREATE", "MonthlyUpdates", item.UpdateId, item.MonthLabel);
        return ApiResponse.Success(item.ToDto(), "Monthly update created successfully.", StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update an existing monthly update entry.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPut("{id:int}")]
    [ValidateAntiForgeryToken]
    public IActionResult Update(int id, MonthlyUpdateRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var item = repository.FindMonthlyUpdate(id);
        if (item is null) return ApiResponse.NotFound("Monthly update not found.");
        item.MonthLabel = request.MonthLabel;
        item.DisplayVi = request.DisplayVi;
        item.DisplayEn = request.DisplayEn;
        item.UpdateCount = request.UpdateCount;
        repository.UpdateMonthlyUpdate(item);
        logs.Log(User, "UPDATE", "MonthlyUpdates", id, item.MonthLabel);
        return ApiResponse.Success(item.ToDto(), "Monthly update updated successfully.");
    }

    /// <summary>
    /// Delete a monthly update entry.
    /// </summary>
    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("{id:int}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(int id)
    {
        if (repository.FindMonthlyUpdate(id) is null) return ApiResponse.NotFound("Monthly update not found.");
        repository.DeleteMonthlyUpdate(id);
        logs.Log(User, "DELETE", "MonthlyUpdates", id);
        return ApiResponse.Success(null, "Monthly update deleted successfully.");
    }
}
