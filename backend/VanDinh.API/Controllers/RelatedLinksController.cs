using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/related-links")]
public sealed class RelatedLinksController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll()
    {
        var links = repository.RelatedLinks.Select(x => x.ToDto()).ToList();
        return ApiResponse.Success(links);
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(RelatedLinkRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var userId = GetUserId();
        var item = repository.AddRelatedLink(new RelatedLink
        {
            Title = request.Title,
            Url = request.Url,
            DisplayOrder = request.DisplayOrder,
            IsEnabled = request.IsEnabled,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        });
        logs.Log(User, "CREATE", "RelatedLinks", item.LinkId, item.Title);
        return ApiResponse.Success(item.ToDto(), "Related link created successfully.", StatusCodes.Status201Created);
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPut("{id:int}")]
    [ValidateAntiForgeryToken]
    public IActionResult Update(int id, RelatedLinkRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var item = repository.FindRelatedLink(id);
        if (item is null) return ApiResponse.NotFound("Related link not found.");

        var userId = GetUserId();
        item.Title = request.Title;
        item.Url = request.Url;
        item.DisplayOrder = request.DisplayOrder;
        item.IsEnabled = request.IsEnabled;
        item.UpdatedBy = userId;
        item.UpdatedAt = DateTime.UtcNow;
        repository.UpdateRelatedLink(item);
        logs.Log(User, "UPDATE", "RelatedLinks", id, item.Title);
        return ApiResponse.Success(item.ToDto(), "Related link updated successfully.");
    }

    [Authorize(Roles = "MANAGER")]
    [HttpDelete("{id:int}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(int id)
    {
        if (repository.FindRelatedLink(id) is null) return ApiResponse.NotFound("Related link not found.");
        repository.DeleteRelatedLink(id);
        logs.Log(User, "DELETE", "RelatedLinks", id);
        return ApiResponse.Success(null, "Related link deleted successfully.");
    }

    private long GetUserId()
    {
        var idText = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        _ = long.TryParse(idText, out var userId);
        return userId;
    }
}
