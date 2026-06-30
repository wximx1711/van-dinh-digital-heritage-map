using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Provides access to monthly update statistics used in dashboard charts.
/// </summary>
[ApiController]
[Route("api/monthly-updates")]
public sealed class MonthlyUpdatesController(IAppRepository repository) : ControllerBase
{
    /// <summary>
    /// Get all monthly update statistics.
    /// </summary>
    [HttpGet]
    public IActionResult GetAll() => ApiResponse.Success(repository.MonthlyUpdates.Select(x => x.ToDto()).ToList());
}
