using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/activity-logs")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class ActivityLogsController(IAppRepository repository) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<ActivityLogDto>> GetAll() => repository.ActivityLogs.Select(x => x.ToDto()).ToList();
}
