using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Provides access to system activity logs with pagination and filtering.
/// Logs capture all CREATE, UPDATE, DELETE, LOGIN, and LOGOUT operations.
/// </summary>
[ApiController]
[Route("api/activity-logs")]
[Authorize(Roles = "ADMIN")]
public sealed class ActivityLogsController(IAppRepository repository) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? user = null, [FromQuery] string? action = null, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = repository.ActivityLogsUntracked;

        if (!string.IsNullOrWhiteSpace(user))
        {
            query = query.Where(l => l.User != null && l.User.Username.Contains(user));
        }
        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(l => l.Action != null && l.Action == action);
        }
        if (fromDate.HasValue)
        {
            query = query.Where(l => l.CreatedAt >= fromDate.Value);
        }
        if (toDate.HasValue)
        {
            query = query.Where(l => l.CreatedAt <= toDate.Value);
        }

        var totalRecords = query.Count();
        var logList = query.OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
        var data = logList.Select(x => x.ToDto()).ToList();
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

        var result = new PagedResult<ActivityLogDto>(data, page, pageSize, totalRecords, totalPages);
        return ApiResponse.Success(result);
    }
}
