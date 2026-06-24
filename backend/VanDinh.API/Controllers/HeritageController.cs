using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/heritage")]
public sealed class HeritageController(IHeritageService service, IAppRepository repository, IActivityLogService logs) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<HeritageDto>> Search([FromQuery] string? q, [FromQuery] string? type, [FromQuery] string? classification, [FromQuery] string? status) =>
        service.Search(q, type, classification, status).ToList();

    [HttpGet("{id}")]
    public ActionResult<HeritageDto> Get(string id)
    {
        var item = service.Get(id);
        return item is null ? NotFound() : item;
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public ActionResult<HeritageDto> Create(HeritageRequest request)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = service.Create(request, userId);
        logs.Log(User, "CREATE", "Heritage", repository.FindHeritage(item.Id)?.HeritageId, item.Code);
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPut("{id}")]
    [ValidateAntiForgeryToken]
    public ActionResult<HeritageDto> Update(string id, HeritageRequest request)
    {
        var item = service.Update(id, request);
        if (item is null) return NotFound();
        logs.Log(User, "UPDATE", "Heritage", repository.FindHeritage(id)?.HeritageId, item.Code);
        return item;
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpDelete("{id}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete(string id)
    {
        var entityId = repository.FindHeritage(id)?.HeritageId;
        if (!service.Delete(id)) return NotFound();
        logs.Log(User, "DELETE", "Heritage", entityId, id);
        return NoContent();
    }
}
