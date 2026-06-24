using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "ADMIN")]
public sealed class UsersController(IUserService service, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<UserDto>> GetAll() => service.GetAll().ToList();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public ActionResult<UserDto> Create(UserCreateRequest request)
    {
        var user = service.Create(request);
        logs.Log(User, "CREATE", "Users", user.UserId, user.Username);
        return CreatedAtAction(nameof(GetAll), user);
    }

    [HttpPut("{id:long}")]
    [ValidateAntiForgeryToken]
    public ActionResult<UserDto> Update(long id, UserUpdateRequest request)
    {
        var user = service.Update(id, request);
        if (user is null) return NotFound();
        logs.Log(User, "UPDATE", "Users", id, user.Username);
        return user;
    }

    [HttpPost("{id:long}/reset-password")]
    [ValidateAntiForgeryToken]
    public IActionResult ResetPassword(long id, ResetPasswordRequest request)
    {
        if (!service.ResetPassword(id, request.NewPassword)) return NotFound();
        logs.Log(User, "RESET_PASSWORD", "Users", id);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(long id)
    {
        if (!service.Delete(id)) return NotFound();
        logs.Log(User, "DELETE", "Users", id);
        return NoContent();
    }
}
