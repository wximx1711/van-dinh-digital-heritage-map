using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Returns real-time statistics about the heritage database including counts by classification and type.
/// </summary>
[ApiController]
[Route("api/statistics")]
public sealed class StatisticsController(IAppRepository repository) : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var heritageQuery = repository.HeritagesUntracked;
        var categories = repository.Categories.ToDictionary(x => x.CategoryId, x => x.Code);
        var docCount = heritageQuery.SelectMany(h => h.Documents).Count();
        var videoCount = heritageQuery.SelectMany(h => h.Videos).Count();
        var imageCount = heritageQuery.SelectMany(h => h.Images).Count();
        var monthlyUpdates = repository.MonthlyUpdates.Select(x => x.ToDto()).ToList();

        var result = new
        {
            TotalHeritage = heritageQuery.Count(),
            National = heritageQuery.Count(x => x.Classification == "national"),
            City = heritageQuery.Count(x => x.Classification == "city"),
            Unranked = heritageQuery.Count(x => x.Classification == "unranked"),
            Intangible = repository.IntangibleHeritagesUntracked.Count(),
            Images = imageCount,
            Videos = videoCount,
            Documents = docCount,
            Categories = repository.Categories.Count,
            ByType = heritageQuery.Select(h => h.CategoryId).ToList()
                .GroupBy(id => categories.GetValueOrDefault(id, "unknown")).ToDictionary(x => x.Key, x => x.Count()),
            ByStatus = heritageQuery.Select(h => h.Status).ToList()
                .GroupBy(s => s).ToDictionary(x => x.Key, x => x.Count()),
            MonthlyUpdates = monthlyUpdates
        };
        return ApiResponse.Success(result);
    }
}
