using Microsoft.AspNetCore.Mvc;
using VanDinh.API.Responses;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/contact")]
public sealed class ContactController : ControllerBase
{
    [HttpPost]
    public IActionResult Send([FromBody] ContactRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
            return ApiResponse.Error("Name, email, and message are required.");

        if (!request.Email.Contains('@'))
            return ApiResponse.Error("Invalid email address.");

        return ApiResponse.Success(new { received = true }, "Message sent successfully.");
    }
}

public sealed record ContactRequest(string Name, string Email, string? Subject, string Message);
