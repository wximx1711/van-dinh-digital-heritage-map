using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/memorial-sites")]
public sealed class MemorialSitesController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet("{id:minlength(1)}")]
    public IActionResult Get([FromRoute] string id)
    {
        var item = repository.FindMemorialSite(id);
        return item is null ? ApiResponse.NotFound("Memorial site not found.") : ApiResponse.Success(item.ToDto());
    }

    [HttpGet]
    public IActionResult GetAll([FromQuery] string? q, [FromQuery] string? category, [FromQuery] string? classification, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = repository.MemorialSitesUntracked;
        var normalized = string.IsNullOrWhiteSpace(q) ? null : System.Text.RegularExpressions.Regex.Replace(q.Trim(), @"\s+", " ");
        if (!string.IsNullOrWhiteSpace(normalized))
        {
            query = query.Where(x => x.NameVi.Contains(normalized) || x.NameEn.Contains(normalized) || x.OtherNames!.Contains(normalized));
        }
        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(x => x.Category == category);
        }
        if (!string.IsNullOrWhiteSpace(classification))
        {
            query = query.Where(x => x.Classification == classification);
        }
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        var totalRecords = query.Count();
        var items = query.OrderBy(x => x.PublicId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
        var data = items.Select(x => x.ToDto()).ToList();
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

        var result = new { data, page, pageSize, totalRecords, totalPages };
        return ApiResponse.Success(result);
    }

    private List<string> ValidateMemorialSiteRequest(MemorialSiteRequest request)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(request.NameVi) || request.NameVi.Trim().Length < 5 || request.NameVi.Trim().Length > 200)
            errors.Add("Vietnamese name must be between 5 and 200 characters.");
        if (string.IsNullOrWhiteSpace(request.NameEn) || request.NameEn.Trim().Length < 5 || request.NameEn.Trim().Length > 200)
            errors.Add("English name must be between 5 and 200 characters.");
        if (string.IsNullOrWhiteSpace(request.Category))
            errors.Add("Category is required.");
        if (string.IsNullOrWhiteSpace(request.Image))
            errors.Add("Cover image is required.");
        if (!string.IsNullOrWhiteSpace(request.VideoUrl) &&
            !request.VideoUrl.StartsWith("https://www.youtube.com") &&
            !request.VideoUrl.StartsWith("https://youtube.com") &&
            !request.VideoUrl.StartsWith("https://youtu.be"))
            errors.Add("Only YouTube video URLs are accepted.");
        return errors;
    }

    private static string Slugify(string value)
    {
        var chars = value.ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
        return string.Join('-', new string(chars).Split('-', StringSplitOptions.RemoveEmptyEntries));
    }

    private string EnsureUniqueSlug(string slug)
    {
        var candidates = repository.MemorialSitesUntracked
            .Where(x => x.Slug.StartsWith(slug))
            .Select(x => x.Slug)
            .ToList();
        if (!candidates.Contains(slug)) return slug;
        var suffix = 1;
        while (candidates.Contains($"{slug}-{suffix}")) { suffix++; }
        return $"{slug}-{suffix}";
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create([FromBody] MemorialSiteRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var validationErrors = ValidateMemorialSiteRequest(request);
        if (validationErrors.Count > 0)
            return ApiResponse.Error("Validation failed.", validationErrors);

        if (repository.MemorialSitesUntracked.Any(i => i.NameVi == request.NameVi.Trim()))
            return ApiResponse.Error("A memorial site with this Vietnamese name already exists.");
        if (repository.MemorialSitesUntracked.Any(i => i.NameEn == request.NameEn.Trim()))
            return ApiResponse.Error("A memorial site with this English name already exists.");

        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var galleryJson = request.GalleryImages is { Length: > 0 }
            ? System.Text.Json.JsonSerializer.Serialize(request.GalleryImages)
            : null;
        var item = repository.AddMemorialSite(new MemorialSite
        {
            NameVi = request.NameVi.Trim(),
            NameEn = request.NameEn.Trim(),
            Slug = EnsureUniqueSlug(Slugify(request.NameVi)),
            Category = request.Category,
            Classification = request.Classification,
            Status = request.Status,
            OtherNames = request.OtherNames?.Trim(),
            AddressVi = request.AddressVi?.Trim(),
            AddressEn = request.AddressEn?.Trim(),
            Latitude = request.Latitude.HasValue ? (decimal)request.Latitude.Value : null,
            Longitude = request.Longitude.HasValue ? (decimal)request.Longitude.Value : null,
            GoogleMapUrl = request.GoogleMapUrl?.Trim(),
            DescriptionVi = request.DescriptionVi?.Trim(),
            DescriptionEn = request.DescriptionEn?.Trim(),
            HistoryVi = request.HistoryVi?.Trim(),
            HistoryEn = request.HistoryEn?.Trim(),
            EventDate = request.EventDate?.Trim(),
            CommemorationVi = request.CommemorationVi?.Trim(),
            CommemorationEn = request.CommemorationEn?.Trim(),
            ImageUrl = request.Image,
            VideoUrl = request.VideoUrl?.Trim(),
            GalleryImages = galleryJson,
            CreatedBy = userId
        });
        logs.Log(User, "CREATE", "MemorialSite", item.MemorialSiteId, item.PublicId);
        return ApiResponse.Success(item.ToDto(), "Memorial site created successfully.", StatusCodes.Status201Created);
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPut("{id:minlength(1)}")]
    [ValidateAntiForgeryToken]
    public IActionResult Update([FromRoute] string id, [FromBody] MemorialSiteRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var validationErrors = ValidateMemorialSiteRequest(request);
        if (validationErrors.Count > 0)
            return ApiResponse.Error("Validation failed.", validationErrors);

        var item = repository.FindMemorialSite(id);
        if (item is null) return ApiResponse.NotFound("Memorial site not found.");

        if (repository.MemorialSitesUntracked.Any(i => i.NameVi == request.NameVi.Trim() && i.PublicId != id))
            return ApiResponse.Error("A memorial site with this Vietnamese name already exists.");
        if (repository.MemorialSitesUntracked.Any(i => i.NameEn == request.NameEn.Trim() && i.PublicId != id))
            return ApiResponse.Error("A memorial site with this English name already exists.");
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var galleryJson = request.GalleryImages is { Length: > 0 }
            ? System.Text.Json.JsonSerializer.Serialize(request.GalleryImages)
            : null;
        item.NameVi = request.NameVi.Trim();
        item.NameEn = request.NameEn.Trim();
        item.Slug = item.Slug == Slugify(request.NameVi) ? item.Slug : EnsureUniqueSlug(Slugify(request.NameVi));
        item.Category = request.Category;
        item.Classification = request.Classification;
        item.Status = request.Status;
        item.OtherNames = request.OtherNames?.Trim();
        item.AddressVi = request.AddressVi?.Trim();
        item.AddressEn = request.AddressEn?.Trim();
        item.Latitude = request.Latitude.HasValue ? (decimal)request.Latitude.Value : null;
        item.Longitude = request.Longitude.HasValue ? (decimal)request.Longitude.Value : null;
        item.GoogleMapUrl = request.GoogleMapUrl?.Trim();
        item.DescriptionVi = request.DescriptionVi?.Trim();
        item.DescriptionEn = request.DescriptionEn?.Trim();
        item.HistoryVi = request.HistoryVi?.Trim();
        item.HistoryEn = request.HistoryEn?.Trim();
        item.EventDate = request.EventDate?.Trim();
        item.CommemorationVi = request.CommemorationVi?.Trim();
        item.CommemorationEn = request.CommemorationEn?.Trim();
        item.ImageUrl = request.Image;
        item.VideoUrl = request.VideoUrl?.Trim();
        item.GalleryImages = galleryJson;
        item.UpdatedAt = DateTime.UtcNow;
        repository.UpdateMemorialSite(item);
        logs.Log(User, "UPDATE", "MemorialSite", item.MemorialSiteId, item.PublicId);
        return ApiResponse.Success(item.ToDto(), "Memorial site updated successfully.");
    }

    [Authorize(Roles = "MANAGER")]
    [HttpDelete("{id:minlength(1)}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete([FromRoute] string id)
    {
        var item = repository.FindMemorialSite(id);
        if (item is null) return ApiResponse.NotFound("Memorial site not found.");
        repository.DeleteMemorialSite(id);
        logs.Log(User, "DELETE", "MemorialSite", item.MemorialSiteId, item.PublicId);
        return ApiResponse.Success(null, "Memorial site deleted successfully.");
    }
}