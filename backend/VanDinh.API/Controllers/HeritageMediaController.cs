using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Handles media management for heritage sites including images, videos, and documents.
/// Supports file upload with validation and storage in wwwroot/uploads.
/// </summary>
[ApiController]
[Route("api/heritage/{heritageId}/media")]
public sealed class HeritageMediaController(IAppRepository repository, IUploadService uploads, IActivityLogService logs) : ControllerBase
{
    [HttpGet("images")]
    public IActionResult Images(string heritageId)
    {
        var heritage = repository.FindHeritage(heritageId);
        return heritage is null ? ApiResponse.NotFound("Heritage not found.") : ApiResponse.Success(heritage.Images.OrderBy(x => x.SortOrder).Select(x => x.ToDto()).ToList());
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPost("images")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UploadImage(string heritageId, IFormFile file, [FromForm] string? caption, CancellationToken cancellationToken)
    {
        try
        {
            var result = await uploads.SaveAsync(file, "images", [".jpg", ".jpeg", ".png", ".webp"], 5 * 1024 * 1024, cancellationToken);
            var image = repository.AddImage(heritageId, new HeritageImage { ImageUrl = result.Url, Caption = caption, SortOrder = 100 });
            logs.Log(User, "CREATE", "HeritageImages", image.ImageId, heritageId);
            return ApiResponse.Success(image.ToDto(), "Image uploaded successfully.", StatusCodes.Status201Created);
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    [Authorize(Roles = "MANAGER")]
    [HttpDelete("images/{imageId:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteImage(string heritageId, long imageId)
    {
        repository.DeleteImage(heritageId, imageId);
        logs.Log(User, "DELETE", "HeritageImages", imageId, heritageId);
        return ApiResponse.Success(null, "Image deleted successfully.");
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPost("videos")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddVideo(string heritageId, [FromForm] string? title, [FromForm] string? youtubeUrl, [FromForm] string? videoUrl, IFormFile? file, CancellationToken cancellationToken)
    {
        try
        {
            var hasYoutube = !string.IsNullOrWhiteSpace(youtubeUrl);
            var hasVideoUrl = !string.IsNullOrWhiteSpace(videoUrl);
            var url = hasYoutube ? youtubeUrl : hasVideoUrl ? videoUrl : null;
            var type = hasYoutube ? "youtube" : hasVideoUrl || file is not null ? "upload" : null;
            if (file is not null)
            {
                var result = await uploads.SaveAsync(file, "videos", [".mp4", ".webm", ".mov"], 100 * 1024 * 1024, cancellationToken);
                url = result.Url;
            }
            var video = repository.AddVideo(heritageId, new HeritageVideo { Title = title, VideoType = type, VideoUrl = url });
            logs.Log(User, "CREATE", "HeritageVideos", video.VideoId, heritageId);
            return ApiResponse.Success(video.ToDto(), "Video added successfully.", StatusCodes.Status201Created);
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    [Authorize(Roles = "MANAGER")]
    [HttpDelete("videos/{videoId:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteVideo(string heritageId, long videoId)
    {
        repository.DeleteVideo(heritageId, videoId);
        logs.Log(User, "DELETE", "HeritageVideos", videoId, heritageId);
        return ApiResponse.Success(null, "Video deleted successfully.");
    }

    [HttpGet("documents")]
    public IActionResult Documents(string heritageId)
    {
        var heritage = repository.FindHeritage(heritageId);
        return heritage is null ? ApiResponse.NotFound("Heritage not found.") : ApiResponse.Success(heritage.Documents.Select(x => x.ToDto()).ToList());
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPost("documents")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UploadDocument(string heritageId, IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            var result = await uploads.SaveAsync(file, "documents", [".pdf"], 30 * 1024 * 1024, cancellationToken);
            var document = repository.AddDocument(heritageId, new HeritageDocument { FileName = result.FileName, FileUrl = result.Url, FileType = "PDF", FileSize = result.Size });
            logs.Log(User, "CREATE", "HeritageDocuments", document.DocumentId, heritageId);
            return ApiResponse.Success(document.ToDto(), "Document uploaded successfully.", StatusCodes.Status201Created);
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    [Authorize(Roles = "MANAGER")]
    [HttpDelete("documents/{documentId:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteDocument(string heritageId, long documentId)
    {
        repository.DeleteDocument(heritageId, documentId);
        logs.Log(User, "DELETE", "HeritageDocuments", documentId, heritageId);
        return ApiResponse.Success(null, "Document deleted successfully.");
    }
}
