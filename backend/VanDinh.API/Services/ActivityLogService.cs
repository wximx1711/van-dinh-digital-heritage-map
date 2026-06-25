using System.Security.Claims;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Services;

public interface IActivityLogService
{
    void Log(ClaimsPrincipal user, string action, string entityName, long? entityId = null, string? description = null);
}

public sealed class ActivityLogService(IAppRepository repository) : IActivityLogService
{
    public void Log(ClaimsPrincipal user, string action, string entityName, long? entityId = null, string? description = null)
    {
        var idText = user.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = user.Identity?.Name ?? "system";
        _ = long.TryParse(idText, out var userId);

        var log = new ActivityLog
        {
            UserId = userId == 0 ? 1 : userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Description = description,
            CreatedAt = DateTime.UtcNow
        };

        repository.AddLog(log);
    }
}
