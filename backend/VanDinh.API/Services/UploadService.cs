using ImageMagick;
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

        // Convert HEIC/HEIF to JPEG on the server
        if (extension is ".heic" or ".heif")
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;

            using var image = new MagickImage(memoryStream);
            image.Format = MagickFormat.Jpeg;
            image.Quality = 92;

            var jpgName = $"{Guid.NewGuid():N}.jpg";
            var jpgPath = Path.Combine(targetDir, jpgName);
            await image.WriteAsync(jpgPath, cancellationToken);
            log.LogInformation("HEIC/HEIF converted to JPEG, saved filename: {Name}", jpgName);

            var jpgUrl = $"/uploads/{folder}/{jpgName}".Replace("\\", "/");
            var fileInfo = new FileInfo(jpgPath);
            var jpgResult = new UploadResult(jpgUrl, file.FileName, fileInfo.Length);
            log.LogInformation("returned UploadResult: Url={Url}, FileName={Name}, Size={Size}", jpgResult.Url, jpgResult.FileName, jpgResult.Size);
            return jpgResult;
        }

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
