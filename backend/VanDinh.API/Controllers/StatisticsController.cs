using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;

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
        var heritages = repository.Heritages;
        var categories = repository.Categories.ToDictionary(x => x.CategoryId, x => x.Code);
        var docCount = repository.Heritage.SelectMany(h => h.Documents).Count();
        var videoCount = repository.Heritage.SelectMany(h => h.Videos).Count();
        var imageCount = repository.Heritage.SelectMany(h => h.Images).Count();
        var monthlyUpdates = repository.MonthlyUpdates.Select(x => x.ToDto()).ToList();

        var result = new
        {
            TotalHeritage = heritages.Count,
            National = heritages.Count(x => x.Classification == "national"),
            City = heritages.Count(x => x.Classification == "city"),
            Unranked = heritages.Count(x => x.Classification == "unranked"),
            Intangible = repository.IntangibleHeritages.Count,
            Images = imageCount,
            Videos = videoCount,
            Documents = docCount,
            Categories = repository.Categories.Count,
            ByType = heritages.GroupBy(x => categories.GetValueOrDefault(x.CategoryId, "unknown")).ToDictionary(x => x.Key, x => x.Count()),
            ByStatus = heritages.GroupBy(x => x.Status).ToDictionary(x => x.Key, x => x.Count()),
            MonthlyUpdates = monthlyUpdates
        };
        return ApiResponse.Success(result);
    }
}
