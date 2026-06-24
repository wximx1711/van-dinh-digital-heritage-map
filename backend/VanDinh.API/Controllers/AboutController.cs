using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/about")]
public sealed class AboutController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public ActionResult<AboutPageDto> Get() => repository.AboutPage.ToDto();

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPut]
    [ValidateAntiForgeryToken]
    public ActionResult<AboutPageDto> Update(AboutPageRequest request)
    {
        repository.AboutPage.Title = request.Title;
        repository.AboutPage.Content = request.Content;
        repository.AboutPage.BannerImage = request.BannerImage;
        repository.AboutPage.UpdatedAt = DateTime.UtcNow;
        logs.Log(User, "UPDATE", "AboutPage", repository.AboutPage.AboutId);
        return repository.AboutPage.ToDto();
    }
}
