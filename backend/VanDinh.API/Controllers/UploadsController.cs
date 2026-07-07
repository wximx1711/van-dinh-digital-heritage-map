using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "MANAGER")]
public sealed class UploadsController(IUploadService uploads, IAppRepository repository, IWebHostEnvironment env, ILogger<UploadsController> log) : ControllerBase
{
    private static readonly HashSet<string> AllowedFolders = ["images", "videos", "documents"];
    private static readonly Dictionary<string, string> FolderToMediaType = new()
    {
        ["images"] = "image",
        ["videos"] = "video",
        ["documents"] = "document"
    };

    private void TrackMediaFile(UploadResult result, string folder)
    {
        if (repository.FindMediaFileByUrl(result.Url) is null)
        {
            repository.AddMediaFile(new MediaFile
            {
                Url = result.Url,
                FileName = result.FileName,
                FileSize = result.Size,
                MediaType = FolderToMediaType.GetValueOrDefault(folder, "unknown"),
                UploadedAt = DateTime.UtcNow
            });
        }
    }

    [HttpPost("images")]
    public async Task<IActionResult> Image(IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            log.LogInformation("--- BACKEND UPLOAD DEBUG ---");
            log.LogInformation("Request.Path: {Path}", Request.Path);
            log.LogInformation("Uploaded filename: {Name}", file.FileName);
            log.LogInformation("Extension: {Ext}", Path.GetExtension(file.FileName).ToLowerInvariant());
            log.LogInformation("ContentType: {Type}", file.ContentType);
            log.LogInformation("Target folder: images");
            log.LogInformation("File length: {Len}", file.Length);
            log.LogInformation("Allowed extensions: {Exts}", string.Join(", ", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"));

            if (file.Length == 0) { log.LogWarning("VALIDATION FAILED: file is empty"); return ApiResponse.Error("File is empty."); }
            if (file.Length > 5 * 1024 * 1024) { log.LogWarning("VALIDATION FAILED: file too large ({Len} > {Max})", file.Length, 5 * 1024 * 1024); return ApiResponse.Error("File is too large."); }
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedImgs = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp" };
            if (!allowedImgs.Contains(ext)) { log.LogWarning("VALIDATION FAILED: extension '{Ext}' not allowed for images", ext); return ApiResponse.Error("File type is not allowed."); }
            log.LogInformation("VALIDATION PASSED");

            var result = await uploads.SaveAsync(file, "images", allowedImgs, 5 * 1024 * 1024, cancellationToken);
            log.LogInformation("Returned HTTP status: 200");
            TrackMediaFile(result, "images");
            return ApiResponse.Success(result, "Image uploaded successfully.");
        }
        catch (InvalidOperationException ex)
        {
            log.LogWarning("Exception: {Msg}", ex.ToString());
            return ApiResponse.Error(ex.Message);
        }
        catch (Exception ex)
        {
            log.LogError("UNEXPECTED EXCEPTION: {Msg}", ex.ToString());
            return ApiResponse.Error("Internal server error.");
        }
    }

    [HttpPost("videos")]
    public async Task<IActionResult> Video(IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            log.LogInformation("--- BACKEND UPLOAD DEBUG ---");
            log.LogInformation("Request.Path: {Path}", Request.Path);
            log.LogInformation("Uploaded filename: {Name}", file.FileName);
            log.LogInformation("Extension: {Ext}", Path.GetExtension(file.FileName).ToLowerInvariant());
            log.LogInformation("ContentType: {Type}", file.ContentType);
            log.LogInformation("Target folder: videos");
            log.LogInformation("File length: {Len}", file.Length);
            log.LogInformation("Allowed extensions: {Exts}", string.Join(", ", ".mp4", ".webm", ".mov"));

            if (file.Length == 0) { log.LogWarning("VALIDATION FAILED: file is empty"); return ApiResponse.Error("File is empty."); }
            if (file.Length > 100 * 1024 * 1024) { log.LogWarning("VALIDATION FAILED: file too large ({Len} > {Max})", file.Length, 100 * 1024 * 1024); return ApiResponse.Error("File is too large."); }
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedVids = new[] { ".mp4", ".webm", ".mov" };
            if (!allowedVids.Contains(ext)) { log.LogWarning("VALIDATION FAILED: extension '{Ext}' not allowed for videos", ext); return ApiResponse.Error("File type is not allowed."); }
            log.LogInformation("VALIDATION PASSED");

            var result = await uploads.SaveAsync(file, "videos", allowedVids, 100 * 1024 * 1024, cancellationToken);
            log.LogInformation("Returned HTTP status: 200");
            TrackMediaFile(result, "videos");
            return ApiResponse.Success(result, "Video uploaded successfully.");
        }
        catch (InvalidOperationException ex)
        {
            log.LogWarning("Exception: {Msg}", ex.ToString());
            return ApiResponse.Error(ex.Message);
        }
        catch (Exception ex)
        {
            log.LogError("UNEXPECTED EXCEPTION: {Msg}", ex.ToString());
            return ApiResponse.Error("Internal server error.");
        }
    }

    [HttpPost("documents")]
    public async Task<IActionResult> Document(IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            log.LogInformation("--- BACKEND UPLOAD DEBUG ---");
            log.LogInformation("Request.Path: {Path}", Request.Path);
            log.LogInformation("Uploaded filename: {Name}", file.FileName);
            log.LogInformation("Extension: {Ext}", Path.GetExtension(file.FileName).ToLowerInvariant());
            log.LogInformation("ContentType: {Type}", file.ContentType);
            log.LogInformation("Target folder: documents");
            log.LogInformation("File length: {Len}", file.Length);
            log.LogInformation("Allowed extensions: {Exts}", string.Join(", ", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"));

            if (file.Length == 0) { log.LogWarning("VALIDATION FAILED: file is empty"); return ApiResponse.Error("File is empty."); }
            if (file.Length > 30 * 1024 * 1024) { log.LogWarning("VALIDATION FAILED: file too large ({Len} > {Max})", file.Length, 30 * 1024 * 1024); return ApiResponse.Error("File is too large."); }
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedDocs = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx" };
            if (!allowedDocs.Contains(ext)) { log.LogWarning("VALIDATION FAILED: extension '{Ext}' not allowed for documents", ext); return ApiResponse.Error("File type is not allowed."); }
            log.LogInformation("VALIDATION PASSED");

            var result = await uploads.SaveAsync(file, "documents", allowedDocs, 30 * 1024 * 1024, cancellationToken);
            log.LogInformation("Returned HTTP status: 200");
            TrackMediaFile(result, "documents");
            return ApiResponse.Success(result, "Document uploaded successfully.");
        }
        catch (InvalidOperationException ex)
        {
            log.LogWarning("Exception: {Msg}", ex.ToString());
            return ApiResponse.Error(ex.Message);
        }
        catch (Exception ex)
        {
            log.LogError("UNEXPECTED EXCEPTION: {Msg}", ex.ToString());
            return ApiResponse.Error("Internal server error.");
        }
    }

    [HttpDelete("images/{mediaFileId:long}")]
    public IActionResult DeleteImage(long mediaFileId)
    {
        log.LogInformation("--- DeleteImage --- Incoming MediaFileId: {MediaFileId}", mediaFileId);

        var mediaFile = repository.FindMediaFileById(mediaFileId);
        if (mediaFile is null)
        {
            log.LogWarning("DeleteImage: FindMediaFileById returned NULL for ID {MediaFileId}", mediaFileId);
            return ApiResponse.NotFound($"Media file not found. ID={mediaFileId} does not exist in database.");
        }

        log.LogInformation("DeleteImage: Matched MediaFiles record — MediaFileId={Id}, Url={Url}, Type={Type}",
            mediaFile.MediaFileId, mediaFile.Url, mediaFile.MediaType);

        var refCount = repository.CountHeritageReferencesByUrl(mediaFile.Url);

        if (refCount == 0)
        {
            var fileDeleted = uploads.Delete(mediaFile.Url);
            log.LogInformation("DeleteImage: uploads.Delete returned {Result} (unused media)", fileDeleted);
        }
        else
        {
            log.LogInformation("DeleteImage: Media file is referenced by {Count} heritage(s) — keeping physical file", refCount);
        }

        repository.DeleteMediaFile(mediaFile.MediaFileId);

        return ApiResponse.Success(null, "Image deleted successfully.");
    }

    [HttpDelete("videos/{mediaFileId:long}")]
    public IActionResult DeleteVideo(long mediaFileId)
    {
        log.LogInformation("--- DeleteVideo --- Incoming MediaFileId: {MediaFileId}", mediaFileId);

        var mediaFile = repository.FindMediaFileById(mediaFileId);
        if (mediaFile is null)
        {
            log.LogWarning("DeleteVideo: FindMediaFileById returned NULL for ID {MediaFileId}", mediaFileId);
            return ApiResponse.NotFound($"Media file not found. ID={mediaFileId} does not exist in database.");
        }

        log.LogInformation("DeleteVideo: Matched MediaFiles record — MediaFileId={Id}, Url={Url}, Type={Type}",
            mediaFile.MediaFileId, mediaFile.Url, mediaFile.MediaType);

        var refCount = repository.CountHeritageReferencesByUrl(mediaFile.Url);

        if (refCount == 0)
        {
            var fileDeleted = uploads.Delete(mediaFile.Url);
            log.LogInformation("DeleteVideo: uploads.Delete returned {Result} (unused media)", fileDeleted);
        }
        else
        {
            log.LogInformation("DeleteVideo: Media file is referenced by {Count} heritage(s) — keeping physical file", refCount);
        }

        repository.DeleteMediaFile(mediaFile.MediaFileId);

        return ApiResponse.Success(null, "Video deleted successfully.");
    }

    [HttpDelete("documents/{mediaFileId:long}")]
    public IActionResult DeleteDocument(long mediaFileId)
    {
        log.LogInformation("--- DeleteDocument --- Incoming MediaFileId: {MediaFileId}", mediaFileId);

        var mediaFile = repository.FindMediaFileById(mediaFileId);
        if (mediaFile is null)
        {
            log.LogWarning("DeleteDocument: FindMediaFileById returned NULL for ID {MediaFileId}", mediaFileId);
            return ApiResponse.NotFound($"Media file not found. ID={mediaFileId} does not exist in database.");
        }

        log.LogInformation("DeleteDocument: Matched MediaFiles record — MediaFileId={Id}, Url={Url}, Type={Type}",
            mediaFile.MediaFileId, mediaFile.Url, mediaFile.MediaType);

        var refCount = repository.CountHeritageReferencesByUrl(mediaFile.Url);

        if (refCount == 0)
        {
            var fileDeleted = uploads.Delete(mediaFile.Url);
            log.LogInformation("DeleteDocument: uploads.Delete returned {Result} (unused media)", fileDeleted);
        }
        else
        {
            log.LogInformation("DeleteDocument: Media file is referenced by {Count} heritage(s) — keeping physical file", refCount);
        }

        repository.DeleteMediaFile(mediaFile.MediaFileId);

        return ApiResponse.Success(null, "Document deleted successfully.");
    }

    [HttpGet("list")]
    [Authorize(Roles = "MANAGER")]
    public IActionResult ListFiles([FromQuery] string folder = "images")
    {
        if (!AllowedFolders.Contains(folder))
            return ApiResponse.Error("Invalid folder.");

        var root = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var targetDir = Path.Combine(root, "uploads", folder);
        if (!Directory.Exists(targetDir))
            return ApiResponse.Success(Array.Empty<object>());

        log.LogInformation("ListFiles: Scanning directory {TargetDir}, folder={Folder}", targetDir, folder);

        var dbUrls = folder switch
        {
            "images" => repository.FindAllImageUrls(),
            "videos" => repository.FindAllVideoUrls(),
            "documents" => repository.FindAllDocumentUrls(),
            _ => new Dictionary<string, long>()
        };
        log.LogInformation("ListFiles: dbUrls contains {Count} entries from MediaFiles table", dbUrls.Count);

        var files = Directory.GetFiles(targetDir)
            .Select(f =>
            {
                var info = new FileInfo(f);
                var url = $"/uploads/{folder}/{info.Name}";
                var type = folder switch
                {
                    "images" => "image",
                    "videos" => "video",
                    "documents" => "document",
                    _ => "unknown"
                };
                var found = dbUrls.TryGetValue(url, out var id);
                var returnedId = found && id != 0 ? (long?)id : null;

                var usage = repository.CountHeritageReferencesByUrl(url);

                return new
                {
                    id = returnedId,
                    url,
                    fileName = info.Name,
                    size = info.Length,
                    type,
                    uploadedAt = info.CreationTimeUtc.ToString("o"),
                    usageCount = usage
                };
            })
            .OrderByDescending(f => f.uploadedAt)
            .ToList();

        log.LogInformation("ListFiles: Returning {Count} files", files.Count);

        return ApiResponse.Success(files);
    }

    [HttpGet("search")]
    [Authorize(Roles = "MANAGER")]
    public IActionResult Search([FromQuery] MediaSearchRequest request)
    {
        var result = repository.SearchMedia(request);
        return ApiResponse.Success(result);
    }
}
