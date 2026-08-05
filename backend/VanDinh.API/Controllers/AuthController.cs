using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Handles user authentication including login, logout, and current user retrieval.
/// Authentication is cookie-based with session management.
/// </summary>
[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAppRepository repository, IPasswordHasher hasher, IActivityLogService logs) : ControllerBase
{
    // A pre-computed hash of a non-existent password. When the username does not
    // exist we still run a PBKDF2 verification against this constant so response
    // timing does not reveal whether an account name is registered.
    private static readonly string? DummyPasswordHash = CreateDummyHash();

    private static string? CreateDummyHash()
    {
        try
        {
            return new PasswordHasher().Hash("__invalid_password_probe__");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Authenticates a user with username and password.
    /// </summary>
    /// <remarks>
    /// Sample request:
    /// JSON body: { "username": "...", "password": "...", "rememberMe": false }
    /// </remarks>
    /// <returns>Login response with user info and role</returns>
    [HttpPost("login")]
    [ValidateAntiForgeryToken]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var user = repository.FindUser(request.Username);

        if (user is null || !user.Status)
        {
            if (DummyPasswordHash is { } dummy)
            {
                hasher.Verify(request.Password, dummy);
            }
            return ApiResponse.Unauthorized("Invalid username or password.");
        }

        if (!hasher.Verify(request.Password, user.PasswordHash))
        {
            return ApiResponse.Unauthorized("Invalid username or password.");
        }

        var role = repository.Roles.FirstOrDefault(x => x.RoleId == user.RoleId)?.RoleName ?? "MANAGER";
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
        return ApiResponse.Success(new LoginResponse(user.UserId, user.Username, user.FullName, role), "Login successful.");
    }

    /// <summary>
    /// Logs out the current authenticated user by clearing the session cookie.
    /// </summary>
    [Authorize]
    [HttpPost("logout")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        logs.Log(User, "LOGOUT", "Users", null, "User logged out.");
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return ApiResponse.Success(null, "Logout successful.");
    }

    /// <summary>
    /// Gets the current authenticated user's profile information.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(claim, out var id)) return ApiResponse.Unauthorized("Invalid session.");
        var user = repository.FindUser(id);
        if (user is null) return ApiResponse.NotFound("User not found.");
        return ApiResponse.Success(user.ToDto(repository));
    }
}
