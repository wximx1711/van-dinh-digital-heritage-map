using Microsoft.AspNetCore.Mvc;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

[ApiController]
[Route("api/qr")]
public sealed class QrController(IAppRepository repository, IQrCodeService qrCodeService) : ControllerBase
{
    [HttpGet("heritage/{id}")]
    public IActionResult Heritage(string id)
    {
        var item = repository.FindHeritage(id);
        if (item is null) return ApiResponse.NotFound("Heritage not found.");
        var url = $"{Request.Scheme}://{Request.Host}/Heritage/Details/{item.PublicId}";
        var svg = qrCodeService.CreateSvg(url);
        return Content(svg, "image/svg+xml");
    }
}
