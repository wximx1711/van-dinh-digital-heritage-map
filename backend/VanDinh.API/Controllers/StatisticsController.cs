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
        var totalImages = heritages.Sum(h => h.Images.Count);
        var totalVideos = heritages.Sum(h => h.Videos.Count);
        var totalDocuments = heritages.Sum(h => h.Documents.Count);

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
