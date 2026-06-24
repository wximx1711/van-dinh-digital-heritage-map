using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class UploadsController(IUploadService uploads) : ControllerBase
{
    [HttpPost("images")]
    [ValidateAntiForgeryToken]
    public Task<UploadResult> Image(IFormFile file, CancellationToken cancellationToken) =>
        uploads.SaveAsync(file, "images", [".jpg", ".jpeg", ".png", ".webp"], 5 * 1024 * 1024, cancellationToken);

    [HttpPost("videos")]
    [ValidateAntiForgeryToken]
    public Task<UploadResult> Video(IFormFile file, CancellationToken cancellationToken) =>
        uploads.SaveAsync(file, "videos", [".mp4", ".webm", ".mov"], 100 * 1024 * 1024, cancellationToken);

    [HttpPost("documents")]
    [ValidateAntiForgeryToken]
    public Task<UploadResult> Document(IFormFile file, CancellationToken cancellationToken) =>
        uploads.SaveAsync(file, "documents", [".pdf"], 30 * 1024 * 1024, cancellationToken);
}
