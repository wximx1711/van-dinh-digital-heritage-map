using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "ADMIN")]
public sealed class UsersController(IUserService service, IActivityLogService logs, IAppRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? name = null, [FromQuery] string? role = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = repository.UsersUntracked;

        if (!string.IsNullOrWhiteSpace(name))
        {
            var n = name.Trim();
            query = query.Where(u => u.Username.Contains(n) || (u.FullName != null && u.FullName.Contains(n)));
        }
        if (!string.IsNullOrWhiteSpace(role))
        {
            var r = role.Trim();
            query = query.Where(u => u.Role != null && u.Role.RoleName == r);
        }

        var totalRecords = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

        var users = await query
            .OrderBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var roles = repository.Roles;
        var data = users.Select(u => u.ToDto(roles)).ToList();

        var result = new PagedResult<UserDto>(data, page, pageSize, totalRecords, totalPages);
        return ApiResponse.Success(result);
    }

    [HttpGet("{id:long}")]
    public IActionResult GetById(long id)
    {
        var user = service.GetById(id);
        if (user is null) return ApiResponse.NotFound("User not found.");
        return ApiResponse.Success(user);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(UserCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        try
        {
            var user = service.Create(request);
            logs.Log(User, "CREATE", "Users", user.UserId, user.Username);
            return ApiResponse.Success(user, "User created successfully.", StatusCodes.Status201Created);
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    [HttpPut("{id:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult Update(long id, UserUpdateRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        try
        {
            var user = service.Update(id, request);
            if (user is null) return ApiResponse.NotFound("User not found.");
            logs.Log(User, "UPDATE", "Users", id, user.Username);
            return ApiResponse.Success(user, "User updated successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    [HttpPut("{id:long}/role")]
    [ValidateAntiForgeryToken]
    public IActionResult UpdateRole(long id, UpdateRoleRequest request)
    {
        if (!string.Equals(request.RoleName, "ADMIN", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(request.RoleName, "MANAGER", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse.Error("Role must be ADMIN or MANAGER.");
        }

        var user = service.UpdateRole(id, request.RoleName.ToUpperInvariant());
        if (user is null) return ApiResponse.NotFound("User not found.");
        logs.Log(User, "UPDATE_ROLE", "Users", id, request.RoleName.ToUpperInvariant());
        return ApiResponse.Success(user, "Role updated successfully.");
    }

    [HttpPut("{id:long}/status")]
    [ValidateAntiForgeryToken]
    public IActionResult UpdateStatus(long id, UpdateStatusRequest request)
    {
        var user = service.UpdateStatus(id, request.Status);
        if (user is null) return ApiResponse.NotFound("User not found.");
        logs.Log(User, "UPDATE_STATUS", "Users", id, request.Status ? "Active" : "Disabled");
        return ApiResponse.Success(user, $"User {(request.Status ? "enabled" : "disabled")} successfully.");
    }

    [HttpPost("{id:long}/reset-password")]
    [ValidateAntiForgeryToken]
    public IActionResult ResetPassword(long id, ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        try
        {
            if (!service.ResetPassword(id, request.NewPassword)) return ApiResponse.NotFound("User not found.");
            logs.Log(User, "RESET_PASSWORD", "Users", id);
            return ApiResponse.Success(null, "Password reset successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    [HttpDelete("{id:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(long id)
    {
        if (!service.Delete(id)) return ApiResponse.NotFound("User not found.");
        logs.Log(User, "DELETE", "Users", id);
        return ApiResponse.Success(null, "User deleted successfully.");
    }
}