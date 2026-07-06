using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
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

    [Authorize(Roles = "MANAGER")]
    [HttpGet("history")]
    public IActionResult GetHistory()
    {
        var history = repository.AboutPageHistories
            .Select(h => h.ToDto())
            .ToList();
        return ApiResponse.Success(history);
    }

    [Authorize(Roles = "MANAGER")]
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

        if (about.AboutId != 0)
        {
            var history = new AboutPageHistory
            {
                AboutId = about.AboutId,
                TitleVi = about.TitleVi,
                TitleEn = about.TitleEn,
                IntroductionVi = about.IntroductionVi,
                IntroductionEn = about.IntroductionEn,
                MainContentVi = about.MainContentVi,
                MainContentEn = about.MainContentEn,
                BannerImage = about.BannerImage,
                ContactInfo = about.ContactInfo,
                UpdatedBy = about.UpdatedBy,
                CreatedAt = DateTime.UtcNow
            };
            repository.AddAboutPageHistory(history);
        }

        about.TitleVi = request.TitleVi?.Trim();
        about.TitleEn = request.TitleEn?.Trim();
        about.IntroductionVi = request.IntroductionVi?.Trim();
        about.IntroductionEn = request.IntroductionEn?.Trim();
        about.MainContentVi = request.MainContentVi?.Trim();
        about.MainContentEn = request.MainContentEn?.Trim();
        about.BannerImage = request.BannerImage;
        about.ContactInfo = request.ContactInfo;
        about.UpdatedBy = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        about.UpdatedAt = DateTime.UtcNow;
        repository.SaveChanges();
        logs.Log(User, "UPDATE", "AboutPage", about.AboutId);
        return ApiResponse.Success(about.ToDto(), "About page updated successfully.");
    }
}
