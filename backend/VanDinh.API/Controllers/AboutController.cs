using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Manages the About page content displayed on the public website.
/// </summary>
[ApiController]
[Route("api/about")]
public sealed class AboutController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var about = repository.AboutPage.ToDto();
        return ApiResponse.Success(about);
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPut]
    [ValidateAntiForgeryToken]
    public IActionResult Update(AboutPageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var about = repository.AboutPage;
        about.Title = request.Title;
        about.Content = request.Content;
        about.BannerImage = request.BannerImage;
        about.UpdatedAt = DateTime.UtcNow;
        repository.SaveChanges();
        logs.Log(User, "UPDATE", "AboutPage", about.AboutId);
        return ApiResponse.Success(about.ToDto(), "About page updated successfully.");
    }
}
