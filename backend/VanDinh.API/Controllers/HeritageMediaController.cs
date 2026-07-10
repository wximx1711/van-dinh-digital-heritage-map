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
public sealed class HeritageMediaController(IAppRepository repository, IUploadService uploads, IActivityLogService logs, ILogger<HeritageMediaController> logger) : ControllerBase
{
    [HttpGet("images")]
    public IActionResult Images(string heritageId)
    {
        var heritage = repository.FindHeritage(heritageId);
        return heritage is null ? ApiResponse.NotFound("Heritage not found.") : ApiResponse.Success(heritage.Images.OrderBy(x => x.SortOrder).Select(x => x.ToDto()).ToList());
    }

    private void TrackMediaFile(DTOs.UploadResult result, string folder)
    {
        var mediaType = folder switch
        {
            "images" => "image",
            "videos" => "video",
            "documents" => "document",
            _ => "unknown"
        };
        if (repository.FindMediaFileByUrl(result.Url) is null)
        {
            repository.AddMediaFile(new Models.MediaFile
            {
                Url = result.Url,
                FileName = result.FileName,
                FileSize = result.Size,
                MediaType = mediaType,
                UploadedAt = DateTime.UtcNow
            });
        }
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPost("images")]
    public async Task<IActionResult> UploadImage(string heritageId, IFormFile file, [FromForm] string? caption, CancellationToken cancellationToken)
    {
        try
        {
            var result = await uploads.SaveAsync(file, "images", [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".heic", ".heif"], 5 * 1024 * 1024, cancellationToken);
            TrackMediaFile(result, "images");
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
    public IActionResult DeleteImage(string heritageId, long imageId)
    {
        var heritage = repository.FindHeritage(heritageId);
        if (heritage is null)
            return ApiResponse.NotFound("Heritage not found.");

        var image = heritage.Images.FirstOrDefault(i => i.ImageId == imageId);
        if (image is null)
            return ApiResponse.NotFound("Image not found.");

        // RULE 4: Only delete physical file if no other heritage references it
        var refCount = repository.CountHeritageReferencesByUrl(image.ImageUrl);
        if (refCount <= 1)
        {
            uploads.Delete(image.ImageUrl);
            logger.LogInformation("HeritageMediaController.DeleteImage: Deleted physical file {Url} (no other heritage references it)", image.ImageUrl);
            // Clean up MediaFile tracking
            repository.DeleteMediaFileByUrl(image.ImageUrl);
        }
        else
        {
            logger.LogInformation("HeritageMediaController.DeleteImage: Keeping physical file {Url} ({Count} other heritages still reference it)", image.ImageUrl, refCount - 1);
        }

        // Remove the DB record for this heritage
        repository.RemoveImageFromHeritage(heritageId, imageId);
        logs.Log(User, "DELETE", "HeritageImages", imageId, heritageId);
        return ApiResponse.Success(null, "Image deleted successfully.");
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPost("videos")]
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
                TrackMediaFile(result, "videos");
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
    public IActionResult DeleteVideo(string heritageId, long videoId)
    {
        var heritage = repository.FindHeritage(heritageId);
        if (heritage is null)
            return ApiResponse.NotFound("Heritage not found.");

        var video = heritage.Videos.FirstOrDefault(v => v.VideoId == videoId);
        if (video is null)
            return ApiResponse.NotFound("Video not found.");

        if (video.VideoType == "upload" && video.VideoUrl is not null)
        {
            // RULE 4: Only delete physical file if no other heritage references it
            var refCount = repository.CountHeritageReferencesByUrl(video.VideoUrl);
            if (refCount <= 1)
            {
                uploads.Delete(video.VideoUrl);
                logger.LogInformation("HeritageMediaController.DeleteVideo: Deleted physical file {Url}", video.VideoUrl);
                // Clean up MediaFile tracking
                repository.DeleteMediaFileByUrl(video.VideoUrl);
            }
            else
            {
                logger.LogInformation("HeritageMediaController.DeleteVideo: Keeping physical file {Url} ({Count} other heritages still reference it)", video.VideoUrl, refCount - 1);
            }
        }

        repository.RemoveVideoFromHeritage(heritageId, videoId);
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
    public async Task<IActionResult> UploadDocument(string heritageId, IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            var result = await uploads.SaveAsync(file, "documents", [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"], 30 * 1024 * 1024, cancellationToken);
            TrackMediaFile(result, "documents");
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
    public IActionResult DeleteDocument(string heritageId, long documentId)
    {
        var heritage = repository.FindHeritage(heritageId);
        if (heritage is null)
            return ApiResponse.NotFound("Heritage not found.");

        var document = heritage.Documents.FirstOrDefault(d => d.DocumentId == documentId);
        if (document is null)
            return ApiResponse.NotFound("Document not found.");

        if (document.FileUrl is not null)
        {
            // RULE 4: Only delete physical file if no other heritage references it
            var refCount = repository.CountHeritageReferencesByUrl(document.FileUrl);
            if (refCount <= 1)
            {
                uploads.Delete(document.FileUrl);
                logger.LogInformation("HeritageMediaController.DeleteDocument: Deleted physical file {Url}", document.FileUrl);
                // Clean up MediaFile tracking
                repository.DeleteMediaFileByUrl(document.FileUrl);
            }
            else
            {
                logger.LogInformation("HeritageMediaController.DeleteDocument: Keeping physical file {Url} ({Count} other heritages still reference it)", document.FileUrl, refCount - 1);
            }
        }

        repository.RemoveDocumentFromHeritage(heritageId, documentId);
        logs.Log(User, "DELETE", "HeritageDocuments", documentId, heritageId);
        return ApiResponse.Success(null, "Document deleted successfully.");
    }
}
