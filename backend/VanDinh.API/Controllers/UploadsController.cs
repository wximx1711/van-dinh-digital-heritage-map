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
    private static readonly HashSet<string> AllowedFolders = ["images", "videos", "documents"];

    private string GetUploadRoot()
    {
        return env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
    }

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

    [HttpDelete("{fileName}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(string fileName)
    {
        var root = GetUploadRoot();

        foreach (var subDir in AllowedFolders)
        {
            var filePath = Path.Combine(root, "uploads", subDir, fileName);
            var fullPath = Path.GetFullPath(filePath);
            var uploadsDir = Path.GetFullPath(Path.Combine(root, "uploads"));

            if (!fullPath.StartsWith(uploadsDir, StringComparison.OrdinalIgnoreCase))
                continue;

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
                return ApiResponse.Success(new { deleted = true }, "File deleted successfully.");
            }
        }

        return ApiResponse.Error("File not found.");
    }

    [HttpGet("list")]
    [Authorize(Roles = "MANAGER")]
    public IActionResult ListFiles([FromQuery] string folder = "images")
    {
        if (!AllowedFolders.Contains(folder))
            return ApiResponse.Error("Invalid folder.");

        var root = GetUploadRoot();
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
