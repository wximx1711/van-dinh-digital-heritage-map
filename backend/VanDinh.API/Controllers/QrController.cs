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
        var url = $"{Request.Scheme}://{Request.Host}/?page=heritage&id={item.PublicId}";
        var svg = qrCodeService.CreateSvg(url);
        return Content(svg, "image/svg+xml");
    }

    [HttpGet("intangible/{id}")]
    public IActionResult Intangible(string id)
    {
        var item = repository.FindIntangible(id);
        if (item is null) return ApiResponse.NotFound("Intangible heritage not found.");
        var url = $"{Request.Scheme}://{Request.Host}/?page=intangible&id={item.PublicId}";
        var svg = qrCodeService.CreateSvg(url);
        return Content(svg, "image/svg+xml");
    }

    /// <summary>
    /// QR code that opens the public evaluation kiosk pre-selected to a heritage item.
    /// Encodes: /evaluate?type=heritage&amp;id={publicId}
    /// </summary>
    [HttpGet("evaluation/heritage/{id}")]
    public IActionResult EvaluationHeritage(string id)
    {
        var item = repository.FindHeritage(id);
        if (item is null) return ApiResponse.NotFound("Heritage not found.");
        var url = $"{Request.Scheme}://{Request.Host}/evaluate?type=heritage&id={item.PublicId}";
        var svg = qrCodeService.CreateSvg(url);
        return Content(svg, "image/svg+xml");
    }

    /// <summary>
    /// QR code that opens the public evaluation kiosk pre-selected to an intangible heritage item.
    /// Encodes: /evaluate?type=intangible&amp;id={publicId}
    /// </summary>
    [HttpGet("evaluation/intangible/{id}")]
    public IActionResult EvaluationIntangible(string id)
    {
        var item = repository.FindIntangible(id);
        if (item is null) return ApiResponse.NotFound("Intangible heritage not found.");
        var url = $"{Request.Scheme}://{Request.Host}/evaluate?type=intangible&id={item.PublicId}";
        var svg = qrCodeService.CreateSvg(url);
        return Content(svg, "image/svg+xml");
    }
}
