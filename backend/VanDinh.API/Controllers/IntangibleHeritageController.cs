using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/intangible-heritage")]
public sealed class IntangibleHeritageController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<IntangibleHeritageDto>> GetAll() => repository.IntangibleHeritages.Select(x => x.ToDto()).ToList();

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public ActionResult<IntangibleHeritageDto> Create(IntangibleHeritageRequest request)
    {
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
        return item.ToDto();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPut("{id}")]
    [ValidateAntiForgeryToken]
    public ActionResult<IntangibleHeritageDto> Update(string id, IntangibleHeritageRequest request)
    {
        var item = repository.FindIntangible(id);
        if (item is null) return NotFound();
        item.NameVi = request.NameVi;
        item.NameEn = request.NameEn;
        item.Category = request.Category;
        item.DescriptionVi = request.DescriptionVi;
        item.DescriptionEn = request.DescriptionEn;
        item.ImageUrl = request.Image;
        item.VideoUrl = request.VideoUrl;
        repository.UpdateIntangible(item);
        logs.Log(User, "UPDATE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return item.ToDto();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("{id}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(string id)
    {
        var item = repository.FindIntangible(id);
        if (item is null) return NotFound();
        repository.DeleteIntangible(id);
        logs.Log(User, "DELETE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return NoContent();
    }
}
