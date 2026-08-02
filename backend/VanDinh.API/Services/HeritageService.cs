using Microsoft.Extensions.Logging;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services;

public interface IHeritageService
{
    IReadOnlyList<HeritageDto> Search(string? query, string? type, string? classification, string? status);
    IReadOnlyList<HeritageDto> SearchAdvanced(string? query, string? type, string? classification, string? status, string? yearBuilt, string? district);
    HeritageDto? Get(string id);
    Task<HeritageDto> CreateAsync(HeritageRequest request, long userId);
    Task<HeritageDto?> UpdateAsync(string id, HeritageRequest request);
    Task<HeritageDto?> DuplicateAsync(string id, long userId);
    bool Delete(string id);
}

public sealed class HeritageService(
    IAppRepository repository,
    IUploadService uploads,
    ILogger<HeritageService> logger,
    IGoogleMapsCoordinateExtractor coordinateExtractor) : IHeritageService
{
    private static string? NormalizeSearch(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim();
        var normalized = System.Text.RegularExpressions.Regex.Replace(trimmed, @"\s+", " ");
        return normalized;
    }

    public IReadOnlyList<HeritageDto> Search(string? query, string? type, string? classification, string? status)
    {
        var items = repository.Heritages.AsEnumerable();
        var q = NormalizeSearch(query);
        if (!string.IsNullOrWhiteSpace(q))
        {
            items = items.Where(x => x.NameVi.Contains(q, StringComparison.OrdinalIgnoreCase)
                || x.NameEn.Contains(q, StringComparison.OrdinalIgnoreCase)
                || x.Code.Contains(q, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(type))
        {
            var category = repository.FindCategory(type);
            items = items.Where(x => category is not null && x.CategoryId == category.CategoryId);
        }
        if (!string.IsNullOrWhiteSpace(classification)) items = items.Where(x => x.Classification == classification);
        if (!string.IsNullOrWhiteSpace(status)) items = items.Where(x => x.Status == status);
        return items.OrderBy(x => x.Code).Select(x => x.ToDto(repository)).ToList();
    }

    public IReadOnlyList<HeritageDto> SearchAdvanced(string? query, string? type, string? classification, string? status, string? yearBuilt, string? district)
    {
        var items = repository.Heritages.AsEnumerable();
        var q = NormalizeSearch(query);
        if (!string.IsNullOrWhiteSpace(q))
        {
            items = items.Where(x => x.NameVi.Contains(q, StringComparison.OrdinalIgnoreCase)
                || x.NameEn.Contains(q, StringComparison.OrdinalIgnoreCase)
                || x.Code.Contains(q, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(type))
        {
            var category = repository.FindCategory(type);
            items = items.Where(x => category is not null && x.CategoryId == category.CategoryId);
        }
        if (!string.IsNullOrWhiteSpace(classification)) items = items.Where(x => x.Classification == classification);
        if (!string.IsNullOrWhiteSpace(status)) items = items.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(yearBuilt)) items = items.Where(x => x.YearBuilt != null && x.YearBuilt.Contains(yearBuilt));
        if (!string.IsNullOrWhiteSpace(district))
        {
            items = items.Where(x =>
                (x.AddressVi != null && x.AddressVi.Contains(district, StringComparison.OrdinalIgnoreCase)) ||
                (x.AddressEn != null && x.AddressEn.Contains(district, StringComparison.OrdinalIgnoreCase)));
        }
        return items.OrderBy(x => x.Code).Select(x => x.ToDto(repository)).ToList();
    }

    public HeritageDto? Get(string id) => repository.FindHeritage(id)?.ToDto(repository);

    private static void ValidateHeritageRequest(HeritageRequest request, bool isUpdate = false)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.NameVi) || request.NameVi.Trim().Length < 5 || request.NameVi.Trim().Length > 200)
            errors.Add("Heritage Name (Vietnamese) must be between 5 and 200 characters and cannot be empty.");
        if (request.NameVi?.Trim() != request.NameVi)
            errors.Add("Heritage Name (Vietnamese) cannot contain leading or trailing spaces.");

        if (string.IsNullOrWhiteSpace(request.NameEn) || request.NameEn.Trim().Length < 5 || request.NameEn.Trim().Length > 200)
            errors.Add("Heritage Name (English) must be between 5 and 200 characters and cannot be empty.");
        if (request.NameEn?.Trim() != request.NameEn)
            errors.Add("Heritage Name (English) cannot contain leading or trailing spaces.");

        if (string.IsNullOrWhiteSpace(request.Type))
            errors.Add("Category is required.");

        if (string.IsNullOrWhiteSpace(request.Classification))
            errors.Add("Classification is required.");

        if (string.IsNullOrWhiteSpace(request.Status))
            errors.Add("Status is required.");

        if (string.IsNullOrWhiteSpace(request.YearBuilt))
        {
            errors.Add("Year built is required.");
        }

        if (string.IsNullOrWhiteSpace(request.GoogleMapUrl))
        {
            errors.Add("Google Maps URL is required.");
        }

        if (string.IsNullOrWhiteSpace(request.AddressVi) || request.AddressVi.Trim().Length < 5 || request.AddressVi.Trim().Length > 300)
            errors.Add("Address (Vietnamese) must be between 5 and 300 characters.");
        if (string.IsNullOrWhiteSpace(request.AddressEn) || request.AddressEn.Trim().Length < 5 || request.AddressEn.Trim().Length > 300)
            errors.Add("Address (English) must be between 5 and 300 characters.");

        if (string.IsNullOrWhiteSpace(request.DescriptionVi))
            errors.Add("Description (Vietnamese) is required.");
        if (string.IsNullOrWhiteSpace(request.DescriptionEn))
            errors.Add("Description (English) is required.");

        if (string.IsNullOrWhiteSpace(request.HistoryVi))
            errors.Add("History (Vietnamese) is required.");
        if (string.IsNullOrWhiteSpace(request.HistoryEn))
            errors.Add("History (English) is required.");

        if (string.IsNullOrWhiteSpace(request.Image))
            errors.Add("Thumbnail image is required.");

        if (!string.IsNullOrWhiteSpace(request.Guardian) && request.Guardian.Length > 150)
            errors.Add("Guardian must be at most 150 characters.");

        if (errors.Count > 0)
            throw new InvalidOperationException(string.Join(" | ", errors));
    }

    public async Task<HeritageDto> CreateAsync(HeritageRequest request, long userId)
    {
        logger.LogInformation("=== CREATE FLOW START: Heritage ===");
        logger.LogInformation("[1/8] Controller received request: NameVi={NameVi}, NameEn={NameEn}, Code={Code}", request.NameVi, request.NameEn, request.Code);

        // Step 1: DTO Validation (strict HTTP create path only).
        // The bulk importer uses CreateCoreAsync directly because the import
        // data intentionally leaves optional fields empty.
        logger.LogInformation("[2/8] DTO validation starting...");
        ValidateHeritageRequest(request);
        logger.LogInformation("[2/8] DTO validation passed.");

        return await CreateCoreAsync(request, userId);
    }

    /// <summary>
    /// Shared heritage creation pipeline used by both CreateAsync (HTTP)
    /// and the one-time bulk importer. Does NOT apply the strict HTTP
    /// validation so sparse import records (empty descriptions, history,
    /// addresses, maps, media) can be created. All business rules that
    /// matter at persistence time (category existence, unique filtered
    /// index on GoogleMapUrl, generated identifiers, QR URL, audit
    /// fields) are enforced here identically for both callers.
    /// </summary>
    internal async Task<HeritageDto> CreateCoreAsync(HeritageRequest request, long userId)
    {
        try
        {
            // Step 2b: Extract coordinates from Google Maps URL
            logger.LogInformation("[2b/8] Extracting coordinates from Google Maps URL...");
            var (extractedLat, extractedLng) = await coordinateExtractor.ExtractCoordinatesAsync(request.GoogleMapUrl);
            if (extractedLat.HasValue && extractedLng.HasValue)
            {
                logger.LogInformation("[2b/8] Coordinates extracted: Lat={Lat}, Lng={Lng}", extractedLat, extractedLng);
            }
            logger.LogInformation("[2b/8] Coordinate extraction complete.");

            // Step 3: Category lookup
            logger.LogInformation("[3/8] Looking up category: Type={Type}", request.Type);
            var category = repository.FindCategory(request.Type) ?? throw new InvalidOperationException("Category not found.");
            logger.LogInformation("[3/8] Category found: Id={Id}, Code={Code}", category.CategoryId, category.Code);

            // Step 4: DTO → Entity mapping
            logger.LogInformation("[5/8] Mapping HeritageRequest → Heritage entity...");
            var publicId = GeneratePublicId();
            var heritage = new Heritage
            {
                PublicId = publicId,
                Code = request.Code,
                CategoryId = category.CategoryId,
                NameVi = request.NameVi.Trim(),
                NameEn = request.NameEn.Trim(),
                Slug = Slugify(request.NameEn),
                Classification = request.Classification,
                Status = request.Status,
                AddressVi = request.AddressVi?.Trim(),
                AddressEn = request.AddressEn?.Trim(),
                DescriptionVi = request.DescriptionVi?.Trim(),
                DescriptionEn = request.DescriptionEn?.Trim(),
                HistoryVi = request.HistoryVi?.Trim(),
                HistoryEn = request.HistoryEn?.Trim(),
                ThumbnailUrl = request.Image,
                YearBuilt = request.YearBuilt,
                Guardian = request.Guardian?.Trim(),
                CreatedBy = userId,
                GoogleMapUrl = request.GoogleMapUrl?.Trim(),
                Latitude = extractedLat.HasValue ? (decimal)extractedLat.Value : null,
                Longitude = extractedLng.HasValue ? (decimal)extractedLng.Value : null
            };
            heritage.QrCodeUrl = $"/api/qr/heritage/{heritage.PublicId}";
            logger.LogInformation("[5/8] Entity mapped: PublicId={PublicId}, Slug={Slug}", heritage.PublicId, heritage.Slug);

            // Step 5: AddHeritage() + SaveChanges()
            logger.LogInformation("[6/8] Calling repository.AddHeritage() — this triggers SaveChanges()...");
            repository.AddHeritage(heritage);
            logger.LogInformation("[6/8] AddHeritage completed. HeritageId={HeritageId} assigned.", heritage.HeritageId);

            // Step 6: Diagnose entity after load
            logger.LogInformation("[6/8 - DIAGNOSTIC] Inspecting Heritage entity properties after SaveChanges...");
            MappingExtensions.DiagnoseHeritage(heritage, logger, "AFTER-SAVE");

            // Step 7: Add thumbnail image
            if (!string.IsNullOrWhiteSpace(request.Image))
            {
                logger.LogInformation("[7/8] Adding thumbnail image: {Url}", request.Image);
                var img = new HeritageImage { ImageUrl = request.Image, SortOrder = 1 };
                repository.AddImage(heritage.PublicId, img);
                logger.LogInformation("[7/8] Thumbnail image added.");
            }

            // Step 8: Add additional images
            if (request.ImageUrls?.Length > 0)
            {
                logger.LogInformation("[7/8] Adding {Count} additional image(s)...", request.ImageUrls.Length);
                var sortOrder = 2;
                foreach (var url in request.ImageUrls)
                {
                    if (string.IsNullOrWhiteSpace(url)) continue;
                    if (url == request.Image) continue;
                    repository.AddImage(heritage.PublicId, new HeritageImage { ImageUrl = url, SortOrder = sortOrder++ });
                }
                logger.LogInformation("[7/8] Additional images added.");
            }

            // Step 9: Mapping Entity → DTO (triggers Categories query and Images access)
            logger.LogInformation("[8/8] Mapping Heritage entity → HeritageDto (this may trigger additional queries)...");
            var dto = heritage.ToDto(repository);
            logger.LogInformation("[8/8] DTO mapping complete. Returning response.");

            logger.LogInformation("=== CREATE FLOW COMPLETE: Heritage {PublicId} ===", heritage.PublicId);
            return dto;
        }
        catch (Exception ex) when (ex is InvalidOperationException or InvalidCastException)
        {
            logger.LogCritical("=== EXCEPTION IN HERITAGE CREATE ===");
            MappingExtensions.LogMaterializationError(logger, ex, "HeritageService.Create");

            // Diagnose any entities already in the repository cache
            try
            {
                var heritages = repository.Heritages;
                logger.LogInformation("DIAGNOSTIC: Inspecting {Count} loaded Heritage entities from repository...", heritages.Count);
                foreach (var h in heritages)
                {
                    MappingExtensions.DiagnoseHeritage(h, logger, "REPOSITORY-CACHE");
                }
            }
            catch (Exception cacheEx)
            {
                logger.LogError(cacheEx, "DIAGNOSTIC: Failed to inspect repository Heritage cache ({Msg})", cacheEx.Message);
                MappingExtensions.LogMaterializationError(logger, cacheEx, "HeritageService.Create.CacheDiagnostic");
            }

            throw;
        }
    }

    public async Task<HeritageDto?> UpdateAsync(string id, HeritageRequest request)
    {
        ValidateHeritageRequest(request);

        var category = repository.FindCategory(request.Type);
        if (category is null) return null;

        var heritage = repository.FindHeritage(id);
        if (heritage is null) return null;

        var oldNameEn = heritage.NameEn;
        var oldUrl = heritage.GoogleMapUrl;

        // Only resolve URL if it has changed
        var urlChanged = !string.Equals(request.GoogleMapUrl?.Trim(), oldUrl, StringComparison.OrdinalIgnoreCase);
        double? extractedLat = null;
        double? extractedLng = null;

        if (urlChanged)
        {
            (extractedLat, extractedLng) = await coordinateExtractor.ExtractCoordinatesAsync(request.GoogleMapUrl);
        }

        heritage.Code = request.Code;
        heritage.CategoryId = category.CategoryId;
        heritage.NameVi = request.NameVi.Trim();
        heritage.NameEn = request.NameEn.Trim();
        if (!string.Equals(oldNameEn, request.NameEn, StringComparison.OrdinalIgnoreCase))
        {
            heritage.Slug = Slugify(request.NameEn);
        }
        heritage.Classification = request.Classification;
        heritage.Status = request.Status;
        heritage.AddressVi = request.AddressVi?.Trim();
        heritage.AddressEn = request.AddressEn?.Trim();
        heritage.DescriptionVi = request.DescriptionVi?.Trim();
        heritage.DescriptionEn = request.DescriptionEn?.Trim();
        heritage.HistoryVi = request.HistoryVi?.Trim();
        heritage.HistoryEn = request.HistoryEn?.Trim();
        heritage.ThumbnailUrl = request.Image;
        heritage.YearBuilt = request.YearBuilt;
        heritage.Guardian = request.Guardian?.Trim();
        heritage.GoogleMapUrl = request.GoogleMapUrl?.Trim();

        if (urlChanged)
        {
            heritage.Latitude = extractedLat.HasValue ? (decimal)extractedLat.Value : null;
            heritage.Longitude = extractedLng.HasValue ? (decimal)extractedLng.Value : null;
        }

        repository.UpdateHeritage(heritage);

        ReconcileImages(id, request.Image, request.ImageUrls);

        return heritage.ToDto(repository);
    }

    public async Task<HeritageDto?> DuplicateAsync(string id, long userId)
    {
        var source = repository.FindHeritage(id);
        if (source is null) return null;

        logger.LogInformation("=== DUPLICATE FLOW START: Heritage {PublicId} ===", id);

        // Snapshot active heritages once: used for unique-name and code generation
        var heritages = repository.Heritages;

        var nameVi = GenerateUniqueName(source.NameVi, heritages.Select(h => h.NameVi));
        var nameEn = GenerateUniqueName(source.NameEn, heritages.Select(h => h.NameEn));
        logger.LogInformation("DUPLICATE: Generated names NameVi={NameVi}, NameEn={NameEn}", nameVi, nameEn);

        var heritage = new Heritage
        {
            PublicId = GeneratePublicId(),
            Code = GenerateNextCode(heritages),
            CategoryId = source.CategoryId,
            NameVi = nameVi,
            NameEn = nameEn,
            Slug = Slugify(nameEn),
            Classification = source.Classification,
            Status = source.Status,
            AddressVi = source.AddressVi,
            AddressEn = source.AddressEn,
            Latitude = source.Latitude,
            Longitude = source.Longitude,
            DescriptionVi = source.DescriptionVi,
            DescriptionEn = source.DescriptionEn,
            HistoryVi = source.HistoryVi,
            HistoryEn = source.HistoryEn,
            ThumbnailUrl = source.ThumbnailUrl,
            YearBuilt = source.YearBuilt,
            Guardian = source.Guardian,
            CreatedBy = userId,
            // The unique filtered index on GoogleMapUrl prevents two active
            // records sharing the same link; the copy keeps its coordinates
            // and the administrator can paste a new share link while editing.
            GoogleMapUrl = null
        };
        heritage.QrCodeUrl = $"/api/qr/heritage/{heritage.PublicId}";

        await repository.ExecuteInTransactionAsync(async () =>
        {
            repository.AddHeritage(heritage);

            foreach (var image in source.Images.OrderBy(i => i.SortOrder))
            {
                repository.AddImage(heritage.PublicId, new HeritageImage
                {
                    ImageUrl = image.ImageUrl,
                    Caption = image.Caption,
                    SortOrder = image.SortOrder
                });
            }

            // AddImage sets ThumbnailUrl to the first gallery image;
            // restore the source thumbnail so the copy is an exact replica.
            if (!string.Equals(heritage.ThumbnailUrl, source.ThumbnailUrl, StringComparison.OrdinalIgnoreCase))
            {
                heritage.ThumbnailUrl = source.ThumbnailUrl;
                repository.SaveChanges();
            }

            foreach (var video in source.Videos)
            {
                repository.AddVideo(heritage.PublicId, new HeritageVideo
                {
                    Title = video.Title,
                    VideoType = video.VideoType,
                    VideoUrl = video.VideoUrl,
                    ThumbnailUrl = video.ThumbnailUrl
                });
            }

            foreach (var document in source.Documents)
            {
                repository.AddDocument(heritage.PublicId, new HeritageDocument
                {
                    FileName = document.FileName,
                    FileUrl = document.FileUrl,
                    FileType = document.FileType,
                    FileSize = document.FileSize
                });
            }
        });

        logger.LogInformation("=== DUPLICATE FLOW COMPLETE: Heritage {PublicId} ===", heritage.PublicId);
        return heritage.ToDto(repository);
    }

    public bool Delete(string id)
    {
        var heritage = repository.FindHeritage(id);
        if (heritage is null) return false;

        // ── RULE 3: Cascade-delete media files ───────────────────────
        // Collect every media URL referenced by this heritage
        var mediaUrls = new List<string>();
        if (!string.IsNullOrWhiteSpace(heritage.ThumbnailUrl))
            mediaUrls.Add(heritage.ThumbnailUrl);
        mediaUrls.AddRange(heritage.Images.Select(i => i.ImageUrl));
        mediaUrls.AddRange(
            heritage.Videos.Where(v => !string.IsNullOrWhiteSpace(v.VideoUrl))
                           .Select(v => v.VideoUrl!));
        mediaUrls.AddRange(
            heritage.Documents.Where(d => !string.IsNullOrWhiteSpace(d.FileUrl))
                              .Select(d => d.FileUrl!));

        // Delete physical files only if NO OTHER heritage still references them
        foreach (var url in mediaUrls.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var refCount = repository.CountHeritageReferencesByUrl(url);
            // refCount includes THIS heritage (still active);
            // after soft-delete it will be (refCount - 1)
            if (refCount <= 1)
            {
                var fileDeleted = uploads.Delete(url);
                if (fileDeleted)
                {
                    repository.DeleteMediaFileByUrl(url);
                }
            }
        }

        // Remove all media DB records for this heritage
        repository.DeleteAllMediaForHeritage(id);

        // Soft-delete the heritage itself
        repository.DeleteHeritage(id);
        return true;
    }

    private void ReconcileImages(string publicId, string? thumbnailUrl, string[]? imageUrls)
    {
        var existingImages = repository.FindHeritage(publicId)?.Images;
        if (existingImages is null) return;

        var newUrls = (imageUrls ?? [])
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (!string.IsNullOrWhiteSpace(thumbnailUrl))
            newUrls.Add(thumbnailUrl);

        // RULE 4: Remove images no longer in the set
        foreach (var image in existingImages)
        {
            if (!newUrls.Contains(image.ImageUrl))
            {
                // Remove the DB record for this heritage
                var removedUrl = repository.RemoveImageFromHeritage(publicId, image.ImageId);

                // Delete physical file only if NOT referenced by any OTHER heritage
                if (removedUrl is not null)
                {
                    var remainingRefs = repository.CountHeritageReferencesByUrl(removedUrl);
                    if (remainingRefs == 0)
                    {
                        var fileDeleted = uploads.Delete(removedUrl);
                        if (fileDeleted)
                        {
                            repository.DeleteMediaFileByUrl(removedUrl);
                        }
                    }
                }
            }
        }

        // Reload to get updated tracking state
        var currentUrls = repository.FindHeritage(publicId)?.Images
            .Select(x => x.ImageUrl)
            .ToHashSet(StringComparer.OrdinalIgnoreCase) ?? [];

        var sortOrder = currentUrls.Count + 1;
        foreach (var url in newUrls)
        {
            if (!currentUrls.Contains(url))
            {
                repository.AddImage(publicId, new HeritageImage { ImageUrl = url, SortOrder = sortOrder++ });
            }
        }
    }

    private string GeneratePublicId()
    {
        return "h" + Guid.NewGuid().ToString("N")[..8];
    }

    private static string Slugify(string value)
    {
        var chars = value.ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
        return string.Join('-', new string(chars).Split('-', StringSplitOptions.RemoveEmptyEntries));
    }

    private static readonly System.Text.RegularExpressions.Regex CopySuffixRegex = new(
        @"\s*\(Copy(?:\s+\d+)?\)\s*$",
        System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Compiled);

    private static string GenerateUniqueName(string name, IEnumerable<string> existingNames)
    {
        const int maxNameLength = 200;

        var trimmed = (name ?? "").Trim();
        var match = CopySuffixRegex.Match(trimmed);
        var stem = match.Success ? trimmed[..match.Index].TrimEnd() : trimmed;

        var existing = existingNames
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .Select(n => n.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var number = 1;
        while (true)
        {
            var suffix = number == 1 ? " (Copy)" : $" (Copy {number})";
            var baseStem = stem.Length + suffix.Length <= maxNameLength ? stem : stem[..Math.Max(0, maxNameLength - suffix.Length)];
            var candidate = $"{baseStem}{suffix}";
            if (!existing.Contains(candidate)) return candidate;
            number++;
        }
    }

    internal static string GenerateNextCode(IEnumerable<Heritage> heritages)
    {
        const string prefix = "VĐHN-DT-";
        var maxNum = heritages
            .Select(h => h.Code)
            .Where(c => c.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            .Select(c => int.TryParse(c[prefix.Length..], out var n) ? n : 0)
            .DefaultIfEmpty(0)
            .Max();
        return $"{prefix}{(maxNum + 1).ToString().PadLeft(3, '0')}";
    }
}
