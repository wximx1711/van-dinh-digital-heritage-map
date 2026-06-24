using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/heritage-categories")]
public sealed class HeritageCategoriesController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<HeritageCategoryDto>> GetAll() => repository.Categories.Select(x => x.ToDto()).ToList();

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public ActionResult<HeritageCategoryDto> Create(HeritageCategoryRequest request)
    {
        var item = repository.AddCategory(new HeritageCategory { Code = request.Code, NameVi = request.NameVi, NameEn = request.NameEn, IconUrl = request.IconUrl });
        logs.Log(User, "CREATE", "HeritageCategories", item.CategoryId, item.Code);
        return CreatedAtAction(nameof(GetAll), item.ToDto());
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPut("{id:int}")]
    [ValidateAntiForgeryToken]
    public ActionResult<HeritageCategoryDto> Update(int id, HeritageCategoryRequest request)
    {
        var item = repository.FindCategory(id);
        if (item is null) return NotFound();
        item.Code = request.Code;
        item.NameVi = request.NameVi;
        item.NameEn = request.NameEn;
        item.IconUrl = request.IconUrl;
        repository.UpdateCategory(item);
        logs.Log(User, "UPDATE", "HeritageCategories", id, item.Code);
        return item.ToDto();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("{id:int}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(int id)
    {
        if (repository.FindCategory(id) is null) return NotFound();
        repository.DeleteCategory(id);
        logs.Log(User, "DELETE", "HeritageCategories", id);
        return NoContent();
    }
}
