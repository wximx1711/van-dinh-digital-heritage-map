using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/heritage-categories")]
public sealed class HeritageCategoriesController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => ApiResponse.Success(repository.Categories.Select(x => x.ToDto()).ToList());

    [Authorize(Roles = "MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(HeritageCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var item = repository.AddCategory(new HeritageCategory { Code = request.Code, NameVi = request.NameVi, NameEn = request.NameEn, IconUrl = request.IconUrl });
        logs.Log(User, "CREATE", "HeritageCategories", item.CategoryId, item.Code);
        return ApiResponse.Success(item.ToDto(), "Category created successfully.", StatusCodes.Status201Created);
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPut("{id:int}")]
    [ValidateAntiForgeryToken]
    public IActionResult Update(int id, HeritageCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var item = repository.FindCategory(id);
        if (item is null) return ApiResponse.NotFound("Category not found.");
        item.Code = request.Code;
        item.NameVi = request.NameVi;
        item.NameEn = request.NameEn;
        item.IconUrl = request.IconUrl;
        repository.UpdateCategory(item);
        logs.Log(User, "UPDATE", "HeritageCategories", id, item.Code);
        return ApiResponse.Success(item.ToDto(), "Category updated successfully.");
    }

    [Authorize(Roles = "MANAGER")]
    [HttpDelete("{id:int}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(int id)
    {
        if (repository.FindCategory(id) is null) return ApiResponse.NotFound("Category not found.");
        if (repository.Heritages.Any(h => h.CategoryId == id))
            return ApiResponse.Error("Cannot delete category: it is in use by one or more heritage sites.");
        repository.DeleteCategory(id);
        logs.Log(User, "DELETE", "HeritageCategories", id);
        return ApiResponse.Success(null, "Category deleted successfully.");
    }
}
