using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Manages intangible cultural heritage items such as festivals, performances, and crafts.
/// Intangible heritage items represent non-physical cultural assets of the community.
/// </summary>
[ApiController]
[Route("api/intangible-heritage")]
public sealed class IntangibleHeritageController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => ApiResponse.Success(repository.IntangibleHeritages.Select(x => x.ToDto()).ToList());

    [Authorize(Roles = "MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(IntangibleHeritageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var item = repository.AddIntangible(new IntangibleHeritage
        {
            NameVi = request.NameVi,
            NameEn = request.NameEn,
            Category = request.Category,
            DescriptionVi = request.DescriptionVi,
            DescriptionEn = request.DescriptionEn,
            ImageUrl = request.Image,
            VideoUrl = request.VideoUrl
        });
        logs.Log(User, "CREATE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return ApiResponse.Success(item.ToDto(), "Intangible heritage created successfully.", StatusCodes.Status201Created);
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPut("{id}")]
    [ValidateAntiForgeryToken]
    public IActionResult Update(string id, IntangibleHeritageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var item = repository.FindIntangible(id);
        if (item is null) return ApiResponse.NotFound("Intangible heritage not found.");
        item.NameVi = request.NameVi;
        item.NameEn = request.NameEn;
        item.Category = request.Category;
        item.DescriptionVi = request.DescriptionVi;
        item.DescriptionEn = request.DescriptionEn;
        item.ImageUrl = request.Image;
        item.VideoUrl = request.VideoUrl;
        repository.UpdateIntangible(item);
        logs.Log(User, "UPDATE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return ApiResponse.Success(item.ToDto(), "Intangible heritage updated successfully.");
    }

    [Authorize(Roles = "MANAGER")]
    [HttpDelete("{id}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(string id)
    {
        var item = repository.FindIntangible(id);
        if (item is null) return ApiResponse.NotFound("Intangible heritage not found.");
        repository.DeleteIntangible(id);
        logs.Log(User, "DELETE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return ApiResponse.Success(null, "Intangible heritage deleted successfully.");
    }
}
