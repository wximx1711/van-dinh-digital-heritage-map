using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "MANAGER")]
public sealed class UploadsController(IUploadService uploads, IWebHostEnvironment env) : ControllerBase
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

    [HttpDelete("{**path}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(string path)
    {
        var root = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var filePath = Path.Combine(root, "uploads", path);
        if (!System.IO.File.Exists(filePath))
            return ApiResponse.Error("File not found.");
        System.IO.File.Delete(filePath);
        return ApiResponse.Success(new { deleted = true }, "File deleted successfully.");
    }

    [HttpGet("list")]
    public IActionResult ListFiles([FromQuery] string folder = "images")
    {
        var root = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var targetDir = Path.Combine(root, "uploads", folder);
        if (!Directory.Exists(targetDir))
            return ApiResponse.Success(Array.Empty<object>());

        var files = Directory.GetFiles(targetDir)
            .Select(f =>
            {
                var info = new FileInfo(f);
                var type = folder switch
                {
                    "images" => "image",
                    "videos" => "video",
                    "documents" => "document",
                    _ => "unknown"
                };
                return new
                {
                    url = $"/uploads/{folder}/{info.Name}",
                    fileName = info.Name,
                    size = info.Length,
                    type,
                    uploadedAt = info.CreationTimeUtc.ToString("o")
                };
            })
            .OrderByDescending(f => f.uploadedAt)
            .ToList();

        return ApiResponse.Success(files);
    }
}
