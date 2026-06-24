using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/statistics")]
public sealed class StatisticsController(IAppRepository repository) : ControllerBase
{
    [HttpGet]
    public ActionResult<StatisticsDto> Get()
    {
        var heritages = repository.Heritages;
        var categories = repository.Categories.ToDictionary(x => x.CategoryId, x => x.Code);
        return new StatisticsDto(
            heritages.Count,
            heritages.Count(x => x.Classification == "national"),
            heritages.Count(x => x.Classification == "city"),
            heritages.Count(x => x.Classification == "unranked"),
            repository.IntangibleHeritages.Count,
            heritages.GroupBy(x => categories.GetValueOrDefault(x.CategoryId, "unknown")).ToDictionary(x => x.Key, x => x.Count()),
            heritages.GroupBy(x => x.Status).ToDictionary(x => x.Key, x => x.Count()));
    }
}
