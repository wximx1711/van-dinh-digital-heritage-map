using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/intangible-heritage")]
public sealed class IntangibleHeritageController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet("{id:minlength(1)}")]
    public IActionResult Get([FromRoute] string id)
    {
        var item = repository.FindIntangible(id);
        return item is null ? ApiResponse.NotFound("Intangible heritage not found.") : ApiResponse.Success(item.ToDto());
    }

    [HttpGet]
    public IActionResult GetAll([FromQuery] string? q, [FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var items = repository.IntangibleHeritages.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            items = items.Where(x => x.NameVi.Contains(q, StringComparison.OrdinalIgnoreCase)
                || x.NameEn.Contains(q, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(category))
        {
            items = items.Where(x => x.Category == category);
        }

        var all = items.OrderBy(x => x.PublicId).ToList();
        var totalRecords = all.Count;
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);
        var data = all.Skip((page - 1) * pageSize).Take(pageSize).Select(x => x.ToDto()).ToList();

        var result = new { data, page, pageSize, totalRecords, totalPages };
        return ApiResponse.Success(result);
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create([FromBody] IntangibleHeritageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        if (repository.IntangibleHeritages.Any(i => i.NameVi == request.NameVi))
            return ApiResponse.Error("An intangible heritage with this Vietnamese name already exists.");
        if (repository.IntangibleHeritages.Any(i => i.NameEn == request.NameEn))
            return ApiResponse.Error("An intangible heritage with this English name already exists.");

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
    [HttpPut("{id:minlength(1)}")]
    [ValidateAntiForgeryToken]
    public IActionResult Update([FromRoute] string id, [FromBody] IntangibleHeritageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var item = repository.FindIntangible(id);
        if (item is null) return ApiResponse.NotFound("Intangible heritage not found.");

        if (repository.IntangibleHeritages.Any(i => i.NameVi == request.NameVi && i.PublicId != id))
            return ApiResponse.Error("An intangible heritage with this Vietnamese name already exists.");
        if (repository.IntangibleHeritages.Any(i => i.NameEn == request.NameEn && i.PublicId != id))
            return ApiResponse.Error("An intangible heritage with this English name already exists.");
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
    [HttpDelete("{id:minlength(1)}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete([FromRoute] string id)
    {
        var item = repository.FindIntangible(id);
        if (item is null) return ApiResponse.NotFound("Intangible heritage not found.");
        repository.DeleteIntangible(id);
        logs.Log(User, "DELETE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return ApiResponse.Success(null, "Intangible heritage deleted successfully.");
    }
}
