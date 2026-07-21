using Microsoft.AspNetCore.Mvc;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/statistics")]
public sealed class StatisticsController(IAppRepository repository) : ControllerBase
{
    [HttpGet("overview")]
    public IActionResult GetOverview()
    {
        var heritages = repository.Heritages;
        var intangible = repository.IntangibleHeritages;
        var categories = repository.Categories;

        var totalHeritage = heritages.Count;
        var nationalCount = heritages.Count(h => h.Classification == "national");
        var cityCount = heritages.Count(h => h.Classification == "city");
        var unrankedCount = heritages.Count(h => h.Classification == "unranked");
        var totalIntangible = intangible.Count;
        // Count media from the MediaFiles table (same source as MediaManagement/search)
        // so that Dashboard and Media Library are always consistent.
        // Previously this code summed Heritage.Images/Videos/Documents collections,
        // which excluded orphaned files and caused the Dashboard to show different
        // counts than the Media Library.
        var totalImages = repository.CountMediaFilesByType("image");
        var totalVideos = repository.CountMediaFilesByType("video");
        var totalDocuments = repository.CountMediaFilesByType("document");

        var classificationBreakdown = heritages
            .GroupBy(h => h.Classification)
            .Select(g => new { classification = g.Key, count = g.Count() })
            .ToList();

        var typeBreakdown = heritages
            .GroupBy(h => h.CategoryId)
            .Select(g =>
            {
                var cat = categories.FirstOrDefault(c => c.CategoryId == g.Key);
                return new { type = cat?.Code ?? "", nameVi = cat?.NameVi ?? "", nameEn = cat?.NameEn ?? "", count = g.Count() };
            })
            .ToList();

        var statusBreakdown = heritages
            .GroupBy(h => h.Status)
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToList();

        var recentHeritages = heritages
            .OrderByDescending(h => h.UpdatedAt ?? h.CreatedAt)
            .Take(10)
            .Select(h =>
            {
                var cat = categories.FirstOrDefault(c => c.CategoryId == h.CategoryId);
                return new
                {
                    id = h.PublicId,
                    code = h.Code,
                    nameVi = h.NameVi,
                    nameEn = h.NameEn,
                    image = h.ThumbnailUrl,
                    classification = h.Classification,
                    type = cat?.Code ?? "",
                    updatedAt = (h.UpdatedAt ?? h.CreatedAt).ToString("yyyy-MM-dd")
                };
            })
            .ToList();

        var result = new
        {
            totalHeritage,
            nationalCount,
            cityCount,
            unrankedCount,
            totalIntangible,
            totalImages,
            totalVideos,
            totalDocuments,
            classificationBreakdown,
            typeBreakdown,
            statusBreakdown,
            recentHeritages
        };

        return ApiResponse.Success(result);
    }
}
