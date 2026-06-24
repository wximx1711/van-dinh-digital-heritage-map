using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAppRepository repository, IPasswordHasher hasher, IActivityLogService logs) : ControllerBase
{
    [HttpPost("login")]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = repository.FindUser(request.Username);
        if (user is null || !user.Status || !hasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var role = repository.Roles.First(x => x.RoleId == user.RoleId).RoleName;
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, role)
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties { IsPersistent = request.RememberMe, ExpiresUtc = DateTimeOffset.UtcNow.AddHours(request.RememberMe ? 24 * 14 : 8) });

        logs.Log(new ClaimsPrincipal(identity), "LOGIN", "Users", user.UserId, "User logged in.");
        return new LoginResponse(user.UserId, user.Username, user.FullName, role);
    }

    [Authorize]
    [HttpPost("logout")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        logs.Log(User, "LOGOUT", "Users", null, "User logged out.");
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<UserDto> Me()
    {
        var id = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = repository.FindUser(id);
        return user is null ? NotFound() : user.ToDto(repository);
    }
}
