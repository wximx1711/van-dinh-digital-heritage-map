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
[Route("api/intangible-heritage")]
public sealed class IntangibleHeritageController(IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet("{id:minlength(1)}")]
    public IActionResult Get([FromRoute] string id)
    {
        var item = repository.FindIntangible(id);
        return item is null ? ApiResponse.NotFound("Intangible heritage not found.") : ApiResponse.Success(item.ToDto());
    }

    [HttpGet]
    public IActionResult GetAll([FromQuery] string? q, [FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = repository.IntangibleHeritagesUntracked;
        var normalized = string.IsNullOrWhiteSpace(q) ? null : System.Text.RegularExpressions.Regex.Replace(q.Trim(), @"\s+", " ");
        if (!string.IsNullOrWhiteSpace(normalized))
        {
            query = query.Where(x => x.NameVi.Contains(normalized) || x.NameEn.Contains(normalized));
        }
        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(x => x.Category == category);
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

    private List<string> ValidateIntangibleRequest(IntangibleHeritageRequest request)
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

    [Authorize(Roles = "MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create([FromBody] IntangibleHeritageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var validationErrors = ValidateIntangibleRequest(request);
        if (validationErrors.Count > 0)
            return ApiResponse.Error("Validation failed.", validationErrors);

        if (repository.IntangibleHeritages.Any(i => i.NameVi == request.NameVi.Trim()))
            return ApiResponse.Error("An intangible heritage with this Vietnamese name already exists.");
        if (repository.IntangibleHeritages.Any(i => i.NameEn == request.NameEn.Trim()))
            return ApiResponse.Error("An intangible heritage with this English name already exists.");

        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var galleryJson = request.GalleryImages is { Length: > 0 }
            ? System.Text.Json.JsonSerializer.Serialize(request.GalleryImages)
            : null;
        var item = repository.AddIntangible(new IntangibleHeritage
        {
            NameVi = request.NameVi.Trim(),
            NameEn = request.NameEn.Trim(),
            Category = request.Category,
            DescriptionVi = request.DescriptionVi?.Trim(),
            DescriptionEn = request.DescriptionEn?.Trim(),
            ImageUrl = request.Image,
            VideoUrl = request.VideoUrl?.Trim(),
            OtherNames = request.OtherNames?.Trim(),
            Location = request.Location?.Trim(),
            CulturalSpace = request.CulturalSpace?.Trim(),
            Community = request.Community?.Trim(),
            RepresentativePersons = request.RepresentativePersons?.Trim(),
            Origin = request.Origin?.Trim(),
            OriginEn = request.OriginEn?.Trim(),
            FormationHistory = request.FormationHistory?.Trim(),
            HistoricalDevelopment = request.HistoricalDevelopment?.Trim(),
            WorshipObjects = request.WorshipObjects?.Trim(),
            FestivalTime = request.FestivalTime?.Trim(),
            FestivalDuration = request.FestivalDuration?.Trim(),
            FestivalLocation = request.FestivalLocation?.Trim(),
            RitualParticipants = request.RitualParticipants?.Trim(),
            RitualProcess = request.RitualProcess?.Trim(),
            CustomsAndOfferings = request.CustomsAndOfferings?.Trim(),
            FolkGames = request.FolkGames?.Trim(),
            TraditionalPerformances = request.TraditionalPerformances?.Trim(),
            RitualObjects = request.RitualObjects?.Trim(),
            RelatedDocuments = request.RelatedDocuments?.Trim(),
            RelatedDocumentsEn = request.RelatedDocumentsEn?.Trim(),
            ExistingArtisans = request.ExistingArtisans?.Trim(),
            TeachingArtisans = request.TeachingArtisans?.Trim(),
            Practitioners = request.Practitioners?.Trim(),
            Learners = request.Learners?.Trim(),
            OtherHumanResources = request.OtherHumanResources?.Trim(),
            TransmissionMethod = request.TransmissionMethod?.Trim(),
            CurrentStatus = request.CurrentStatus?.Trim(),
            CurrentStatusEn = request.CurrentStatusEn?.Trim(),
            ThreatLevel = request.ThreatLevel?.Trim(),
            RiskDescription = request.RiskDescription?.Trim(),
            HeritageValue = request.HeritageValue?.Trim(),
            HeritageValueEn = request.HeritageValueEn?.Trim(),
            ExistingProtectionMeasures = request.ExistingProtectionMeasures?.Trim(),
            ProposedProtectionMeasures = request.ProposedProtectionMeasures?.Trim(),
            GalleryImages = galleryJson,
            CreatedBy = userId
        });
        logs.Log(User, "CREATE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return ApiResponse.Success(item.ToDto(), "Intangible heritage created successfully.", StatusCodes.Status201Created);
    }

    [Authorize(Roles = "MANAGER")]
    [HttpPut("{id:minlength(1)}")]
    [ValidateAntiForgeryToken]
    public IActionResult Update([FromRoute] string id, [FromBody] IntangibleHeritageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        var validationErrors = ValidateIntangibleRequest(request);
        if (validationErrors.Count > 0)
            return ApiResponse.Error("Validation failed.", validationErrors);

        var item = repository.FindIntangible(id);
        if (item is null) return ApiResponse.NotFound("Intangible heritage not found.");

        if (repository.IntangibleHeritages.Any(i => i.NameVi == request.NameVi.Trim() && i.PublicId != id))
            return ApiResponse.Error("An intangible heritage with this Vietnamese name already exists.");
        if (repository.IntangibleHeritages.Any(i => i.NameEn == request.NameEn.Trim() && i.PublicId != id))
            return ApiResponse.Error("An intangible heritage with this English name already exists.");
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var galleryJson = request.GalleryImages is { Length: > 0 }
            ? System.Text.Json.JsonSerializer.Serialize(request.GalleryImages)
            : null;
        item.NameVi = request.NameVi.Trim();
        item.NameEn = request.NameEn.Trim();
        item.Category = request.Category;
        item.DescriptionVi = request.DescriptionVi?.Trim();
        item.DescriptionEn = request.DescriptionEn?.Trim();
        item.ImageUrl = request.Image;
        item.VideoUrl = request.VideoUrl?.Trim();
        item.OtherNames = request.OtherNames?.Trim();
        item.Location = request.Location?.Trim();
        item.CulturalSpace = request.CulturalSpace?.Trim();
        item.Community = request.Community?.Trim();
        item.RepresentativePersons = request.RepresentativePersons?.Trim();
        item.Origin = request.Origin?.Trim();
        item.OriginEn = request.OriginEn?.Trim();
        item.FormationHistory = request.FormationHistory?.Trim();
        item.HistoricalDevelopment = request.HistoricalDevelopment?.Trim();
        item.WorshipObjects = request.WorshipObjects?.Trim();
        item.FestivalTime = request.FestivalTime?.Trim();
        item.FestivalDuration = request.FestivalDuration?.Trim();
        item.FestivalLocation = request.FestivalLocation?.Trim();
        item.RitualParticipants = request.RitualParticipants?.Trim();
        item.RitualProcess = request.RitualProcess?.Trim();
        item.CustomsAndOfferings = request.CustomsAndOfferings?.Trim();
        item.FolkGames = request.FolkGames?.Trim();
        item.TraditionalPerformances = request.TraditionalPerformances?.Trim();
        item.RitualObjects = request.RitualObjects?.Trim();
        item.RelatedDocuments = request.RelatedDocuments?.Trim();
        item.RelatedDocumentsEn = request.RelatedDocumentsEn?.Trim();
        item.ExistingArtisans = request.ExistingArtisans?.Trim();
        item.TeachingArtisans = request.TeachingArtisans?.Trim();
        item.Practitioners = request.Practitioners?.Trim();
        item.Learners = request.Learners?.Trim();
        item.OtherHumanResources = request.OtherHumanResources?.Trim();
        item.TransmissionMethod = request.TransmissionMethod?.Trim();
        item.CurrentStatus = request.CurrentStatus?.Trim();
        item.CurrentStatusEn = request.CurrentStatusEn?.Trim();
        item.ThreatLevel = request.ThreatLevel?.Trim();
        item.RiskDescription = request.RiskDescription?.Trim();
        item.HeritageValue = request.HeritageValue?.Trim();
        item.HeritageValueEn = request.HeritageValueEn?.Trim();
        item.ExistingProtectionMeasures = request.ExistingProtectionMeasures?.Trim();
        item.ProposedProtectionMeasures = request.ProposedProtectionMeasures?.Trim();
        item.GalleryImages = galleryJson;
        item.UpdatedBy = userId;
        repository.UpdateIntangible(item);
        logs.Log(User, "UPDATE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return ApiResponse.Success(item.ToDto(), "Intangible heritage updated successfully.");
    }

    [Authorize(Roles = "MANAGER")]
    [HttpDelete("{id:minlength(1)}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete([FromRoute] string id)
    {
        var item = repository.FindIntangible(id);
        if (item is null) return ApiResponse.NotFound("Intangible heritage not found.");
        repository.DeleteIntangible(id);
        logs.Log(User, "DELETE", "IntangibleHeritage", item.IntangibleId, item.PublicId);
        return ApiResponse.Success(null, "Intangible heritage deleted successfully.");
    }
}
