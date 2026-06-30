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
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class ActivityLogsController(IAppRepository repository) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? user = null, [FromQuery] string? action = null, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var allLogs = repository.ActivityLogs.Select(x => x.ToDto()).AsEnumerable();

        if (!string.IsNullOrWhiteSpace(user))
        {
            allLogs = allLogs.Where(l => (l.Username ?? "").Contains(user, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(action))
        {
            allLogs = allLogs.Where(l => (l.Action ?? "").Equals(action, StringComparison.OrdinalIgnoreCase));
        }
        if (fromDate.HasValue)
        {
            allLogs = allLogs.Where(l => l.CreatedAt >= fromDate.Value);
        }
        if (toDate.HasValue)
        {
            allLogs = allLogs.Where(l => l.CreatedAt <= toDate.Value);
        }

        var logList = allLogs.ToList();
        var totalRecords = logList.Count;
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);
        var data = logList.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var result = new PagedResult<ActivityLogDto>(data, page, pageSize, totalRecords, totalPages);
        return ApiResponse.Success(result);
    }
}
