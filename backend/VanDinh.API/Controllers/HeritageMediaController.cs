using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/heritage/{heritageId}/media")]
public sealed class HeritageMediaController(IAppRepository repository, IUploadService uploads, IActivityLogService logs) : ControllerBase
{
    [HttpGet("images")]
    public ActionResult<IReadOnlyList<HeritageImageDto>> Images(string heritageId)
    {
        var heritage = repository.FindHeritage(heritageId);
        return heritage is null ? NotFound() : heritage.Images.OrderBy(x => x.SortOrder).Select(x => x.ToDto()).ToList();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost("images")]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<HeritageImageDto>> UploadImage(string heritageId, IFormFile file, [FromForm] string? caption, CancellationToken cancellationToken)
    {
        var result = await uploads.SaveAsync(file, "images", [".jpg", ".jpeg", ".png", ".webp"], 5 * 1024 * 1024, cancellationToken);
        var image = repository.AddImage(heritageId, new HeritageImage { ImageUrl = result.Url, Caption = caption, SortOrder = 100 });
        logs.Log(User, "CREATE", "HeritageImages", image.ImageId, heritageId);
        return image.ToDto();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("images/{imageId:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteImage(string heritageId, long imageId)
    {
        repository.DeleteImage(heritageId, imageId);
        logs.Log(User, "DELETE", "HeritageImages", imageId, heritageId);
        return NoContent();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost("videos")]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<HeritageVideoDto>> AddVideo(string heritageId, [FromForm] string? title, [FromForm] string? youtubeUrl, IFormFile? file, CancellationToken cancellationToken)
    {
        var url = youtubeUrl;
        var type = string.IsNullOrWhiteSpace(youtubeUrl) ? "upload" : "youtube";
        if (file is not null)
        {
            var result = await uploads.SaveAsync(file, "videos", [".mp4", ".webm", ".mov"], 100 * 1024 * 1024, cancellationToken);
            url = result.Url;
        }
        var video = repository.AddVideo(heritageId, new HeritageVideo { Title = title, VideoType = type, VideoUrl = url });
        logs.Log(User, "CREATE", "HeritageVideos", video.VideoId, heritageId);
        return video.ToDto();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("videos/{videoId:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteVideo(string heritageId, long videoId)
    {
        repository.DeleteVideo(heritageId, videoId);
        logs.Log(User, "DELETE", "HeritageVideos", videoId, heritageId);
        return NoContent();
    }

    [HttpGet("documents")]
    public ActionResult<IReadOnlyList<HeritageDocumentDto>> Documents(string heritageId)
    {
        var heritage = repository.FindHeritage(heritageId);
        return heritage is null ? NotFound() : heritage.Documents.Select(x => x.ToDto()).ToList();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost("documents")]
    [ValidateAntiForgeryToken]
    public async Task<ActionResult<HeritageDocumentDto>> UploadDocument(string heritageId, IFormFile file, CancellationToken cancellationToken)
    {
        var result = await uploads.SaveAsync(file, "documents", [".pdf"], 30 * 1024 * 1024, cancellationToken);
        var document = repository.AddDocument(heritageId, new HeritageDocument { FileName = result.FileName, FileUrl = result.Url, FileType = "PDF", FileSize = result.Size });
        logs.Log(User, "CREATE", "HeritageDocuments", document.DocumentId, heritageId);
        return document.ToDto();
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("documents/{documentId:long}")]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteDocument(string heritageId, long documentId)
    {
        repository.DeleteDocument(heritageId, documentId);
        logs.Log(User, "DELETE", "HeritageDocuments", documentId, heritageId);
        return NoContent();
    }
}
