using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/system-settings")]
public sealed class SystemSettingsController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public ActionResult<SystemSettingDto> Get() => repository.SystemSetting.ToDto();

    [Authorize(Roles = "ADMIN")]
    [HttpPut]
    [ValidateAntiForgeryToken]
    public ActionResult<SystemSettingDto> Update(SystemSettingRequest request)
    {
        repository.SystemSetting.WebsiteName = request.WebsiteName;
        repository.SystemSetting.LogoUrl = request.LogoUrl;
        repository.SystemSetting.FooterText = request.FooterText;
        repository.SystemSetting.ContactEmail = request.ContactEmail;
        repository.SystemSetting.Phone = request.Phone;
        repository.SystemSetting.Address = request.Address;
        repository.SystemSetting.FacebookUrl = request.FacebookUrl;
        repository.SystemSetting.TiktokUrl = request.TiktokUrl;
        repository.SystemSetting.UpdatedAt = DateTime.UtcNow;
        logs.Log(User, "UPDATE", "SystemSettings", repository.SystemSetting.SettingId);
        return repository.SystemSetting.ToDto();
    }
}
