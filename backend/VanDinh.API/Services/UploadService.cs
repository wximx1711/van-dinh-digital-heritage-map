using VanDinh.API.DTOs;

namespace VanDinh.API.Services;

public interface IUploadService
{
    Task<UploadResult> SaveAsync(IFormFile file, string folder, string[] allowedExtensions, long maxBytes, CancellationToken cancellationToken);
    bool Delete(string url);
}

public sealed class UploadService(IWebHostEnvironment environment, ILogger<UploadService> log) : IUploadService
{
    public async Task<UploadResult> SaveAsync(IFormFile file, string folder, string[] allowedExtensions, long maxBytes, CancellationToken cancellationToken)
    {
        log.LogInformation("--- UploadService.SaveAsync DEBUG ---");
        if (file.Length == 0) throw new InvalidOperationException("File is empty.");
        if (file.Length > maxBytes) throw new InvalidOperationException("File is too large.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension)) throw new InvalidOperationException("File type is not allowed.");

        var root = environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(root))
        {
            root = Path.Combine(environment.ContentRootPath, "wwwroot");
        }

        var targetDir = Path.Combine(root, "uploads", folder);
        log.LogInformation("destination path: {Path}", targetDir);
        var dirExists = Directory.Exists(targetDir);
        Directory.CreateDirectory(targetDir);
        log.LogInformation("created directory (or already existed): existedBefore={Existed}", dirExists);

        var safeName = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(targetDir, safeName);
        log.LogInformation("saved filename: {Name}", safeName);
        log.LogInformation("full path: {Path}", path);
        await using var stream = File.Create(path);
        await file.CopyToAsync(stream, cancellationToken);
        log.LogInformation("file written successfully, size={Len}", file.Length);

        var url = $"/uploads/{folder}/{safeName}".Replace("\\", "/");
        var result = new UploadResult(url, file.FileName, file.Length);
        log.LogInformation("returned UploadResult: Url={Url}, FileName={Name}, Size={Size}", result.Url, result.FileName, result.Size);
        return result;
    }

    public bool Delete(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        if (url.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return false;

        var root = environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(root))
            root = Path.Combine(environment.ContentRootPath, "wwwroot");

        var relativePath = url.TrimStart('/').Replace("/", "\\");
        var fullPath = Path.GetFullPath(Path.Combine(root, relativePath));
        var uploadsDir = Path.GetFullPath(Path.Combine(root, "uploads"));

        if (!fullPath.StartsWith(uploadsDir, StringComparison.OrdinalIgnoreCase))
            return false;

        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
            return true;
        }

        return false;
    }
}
