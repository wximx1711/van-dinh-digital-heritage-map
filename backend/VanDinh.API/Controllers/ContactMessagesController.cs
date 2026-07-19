using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Authorize(Roles = "MANAGER")]
[Route("api/contact-messages")]
public sealed class ContactMessagesController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpPost("search")]
    [ValidateAntiForgeryToken]
    public IActionResult Search([FromBody] ContactMessageSearchRequest request)
    {
        var (page, pageSize) = new PagedRequest { Page = request.Page, PageSize = request.PageSize }.Normalize();

        var query = repository.ContactMessagesUntracked;

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(x =>
                x.FullName.ToLower().Contains(s) ||
                x.Email.ToLower().Contains(s) ||
                (x.Subject != null && x.Subject.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (request.Status == "unread")
                query = query.Where(x => !x.IsRead);
            else if (request.Status == "read")
                query = query.Where(x => x.IsRead);
        }

        if (request.DateFrom.HasValue)
            query = query.Where(x => x.CreatedAt >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(x => x.CreatedAt <= request.DateTo.Value);

        var result = PagedResult<ContactMessageListItem>.Create(
            query.Select(x => new ContactMessageListItem(
                x.Id, x.FullName, x.Email, x.Subject, x.CreatedAt, x.IsRead, x.ReadAt)),
            page, pageSize);

        return ApiResponse.Success(result);
    }

    [HttpGet("{id:long}")]
    public IActionResult GetById(long id)
    {
        var item = repository.FindContactMessage(id);
        if (item is null) return ApiResponse.NotFound("Contact message not found.");

        if (!item.IsRead)
        {
            item.IsRead = true;
            item.ReadAt = DateTime.UtcNow;
            repository.UpdateContactMessage(item);
            logs.Log(User, "READ", "ContactMessages", id);
        }

        return ApiResponse.Success(item.ToDto());
    }

    [HttpDelete("{id:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(long id)
    {
        if (repository.FindContactMessage(id) is null)
            return ApiResponse.NotFound("Contact message not found.");

        repository.DeleteContactMessage(id);
        logs.Log(User, "DELETE", "ContactMessages", id);
        return ApiResponse.Success(null, "Message deleted successfully.");
    }

    [HttpPost("bulk-mark-read")]
    [ValidateAntiForgeryToken]
    public IActionResult BulkMarkRead([FromBody] ContactMessageBulkRequest request)
    {
        if (request.Ids is null || request.Ids.Length == 0)
            return ApiResponse.Error("No IDs provided.");

        var now = DateTime.UtcNow;
        foreach (var id in request.Ids)
        {
            var item = repository.FindContactMessage(id);
            if (item is not null && !item.IsRead)
            {
                item.IsRead = true;
                item.ReadAt = now;
                repository.UpdateContactMessage(item);
            }
        }

        logs.Log(User, "BULK_MARK_READ", "ContactMessages", null);
        return ApiResponse.Success(null, $"{request.Ids.Length} message(s) marked as read.");
    }

    [HttpPost("bulk-delete")]
    [ValidateAntiForgeryToken]
    public IActionResult BulkDelete([FromBody] ContactMessageBulkRequest request)
    {
        if (request.Ids is null || request.Ids.Length == 0)
            return ApiResponse.Error("No IDs provided.");

        foreach (var id in request.Ids)
        {
            repository.DeleteContactMessage(id);
        }

        logs.Log(User, "BULK_DELETE", "ContactMessages", null);
        return ApiResponse.Success(null, $"{request.Ids.Length} message(s) deleted.");
    }

    private long GetUserId()
    {
        var idText = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        _ = long.TryParse(idText, out var userId);
        return userId;
    }
}
