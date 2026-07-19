using Microsoft.AspNetCore.Mvc;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/contact")]
public sealed class ContactController(IAppRepository repository) : ControllerBase
{
    [HttpPost]
    public IActionResult Send([FromBody] ContactRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
            return ApiResponse.Error("Name, email, and message are required.");

        if (!request.Email.Contains('@'))
            return ApiResponse.Error("Invalid email address.");

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        repository.AddContactMessage(new ContactMessage
        {
            FullName = request.Name.Trim(),
            Email = request.Email.Trim(),
            Subject = request.Subject?.Trim(),
            Message = request.Message.Trim(),
            IPAddress = ip,
            UserAgent = userAgent
        });

        return ApiResponse.Success(new { received = true }, "Message sent successfully.");
    }
}

public sealed record ContactRequest(string Name, string Email, string? Subject, string Message);
