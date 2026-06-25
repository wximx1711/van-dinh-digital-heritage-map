using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Generic file upload endpoint supporting images, videos, and documents.
/// Files are stored under wwwroot/uploads/ with unique UUID-based names.
/// </summary>
[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class UploadsController(IUploadService uploads) : ControllerBase
{
    [HttpPost("images")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Image(IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            var result = await uploads.SaveAsync(file, "images", [".jpg", ".jpeg", ".png", ".webp"], 5 * 1024 * 1024, cancellationToken);
            return ApiResponse.Success(result, "Image uploaded successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    [HttpPost("videos")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Video(IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            var result = await uploads.SaveAsync(file, "videos", [".mp4", ".webm", ".mov"], 100 * 1024 * 1024, cancellationToken);
            return ApiResponse.Success(result, "Video uploaded successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    [HttpPost("documents")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Document(IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            var result = await uploads.SaveAsync(file, "documents", [".pdf"], 30 * 1024 * 1024, cancellationToken);
            return ApiResponse.Success(result, "Document uploaded successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }
}
