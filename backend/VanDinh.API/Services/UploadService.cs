using VanDinh.API.DTOs;

namespace VanDinh.API.Services;

public interface IUploadService
{
    Task<UploadResult> SaveAsync(IFormFile file, string folder, string[] allowedExtensions, long maxBytes, CancellationToken cancellationToken);
}

public sealed class UploadService(IWebHostEnvironment environment) : IUploadService
{
    public async Task<UploadResult> SaveAsync(IFormFile file, string folder, string[] allowedExtensions, long maxBytes, CancellationToken cancellationToken)
    {
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
        Directory.CreateDirectory(targetDir);

        var safeName = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(targetDir, safeName);
        await using var stream = File.Create(path);
        await file.CopyToAsync(stream, cancellationToken);

        var url = $"/uploads/{folder}/{safeName}".Replace("\\", "/");
        return new UploadResult(url, file.FileName, file.Length);
    }
}
