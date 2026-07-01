using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Manages system-wide settings such as website name, contact info, and social media links.
/// </summary>
[ApiController]
[Route("api/system-settings")]
public sealed class SystemSettingsController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => ApiResponse.Success(repository.SystemSetting.ToDto());

    [Authorize(Roles = "MANAGER")]
    [HttpPut]
    [ValidateAntiForgeryToken]
    public IActionResult Update(SystemSettingRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        repository.SystemSetting.WebsiteName = request.WebsiteName;
        repository.SystemSetting.LogoUrl = request.LogoUrl;
        repository.SystemSetting.FooterText = request.FooterText;
        repository.SystemSetting.ContactEmail = request.ContactEmail;
        repository.SystemSetting.Phone = request.Phone;
        repository.SystemSetting.Address = request.Address;
        repository.SystemSetting.FacebookUrl = request.FacebookUrl;
        repository.SystemSetting.TiktokUrl = request.TiktokUrl;
        repository.SystemSetting.UpdatedAt = DateTime.UtcNow;
        repository.SaveChanges();
        logs.Log(User, "UPDATE", "SystemSettings", repository.SystemSetting.SettingId);
        return ApiResponse.Success(repository.SystemSetting.ToDto(), "System settings updated successfully.");
    }
}
