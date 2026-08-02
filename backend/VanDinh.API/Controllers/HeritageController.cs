using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using VanDinh.API.DTOs;
using VanDinh.API.Repositories;
using VanDinh.API.Responses;
using VanDinh.API.Services;

namespace VanDinh.API.Controllers;

/// <summary>
/// Manages tangible heritage sites including CRUD operations, search, and filtering.
/// Heritage sites represent physical cultural heritage locations with maps, images, and descriptions.
/// </summary>
[ApiController]
[Route("api/heritage")]
public sealed class HeritageController(
    IHeritageService service,
    IAppRepository repository,
    IActivityLogService logs,
    ILogger<HeritageController> controllerLogger) : ControllerBase
{
    [HttpGet]
    public IActionResult Search([FromQuery] string? q, [FromQuery] string? type, [FromQuery] string? classification, [FromQuery] string? status, [FromQuery] string? yearBuilt, [FromQuery] string? district, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        q = q?.Trim();
        var allResults = service.SearchAdvanced(q, type, classification, status, yearBuilt, district).ToList();
        var totalRecords = allResults.Count;
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);
        var data = allResults.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var result = new { data, page, pageSize, totalRecords, totalPages };
        return ApiResponse.Success(result);
    }

    /// <summary>
    /// Get details of a specific heritage site by public ID.
    /// </summary>
    /// <param name="id">The public ID of the heritage site (e.g., h001).</param>
    /// <returns>Full heritage site details</returns>
    [HttpGet("{id:minlength(1)}")]
    public IActionResult Get([FromRoute] string id)
    {
        var item = service.Get(id);
        return item is null ? ApiResponse.NotFound("Heritage item not found.") : ApiResponse.Success(item);
    }

    /// <summary>
    /// Create a new heritage site.
    /// </summary>
    /// <returns>Created heritage site details</returns>
    [Authorize(Roles = "MANAGER")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([FromBody] HeritageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        try
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var item = await service.CreateAsync(request, userId);
            logs.Log(User, "CREATE", "Heritage", repository.FindHeritage(item.Id)?.HeritageId, item.Code);
            return ApiResponse.Success(item, "Heritage created successfully.", StatusCodes.Status201Created);
        }
        catch (InvalidOperationException ex)
        {
            controllerLogger.LogError(ex, "InvalidOperationException in HeritageController.Create: {Msg}", ex.Message);
            var inner = ex.InnerException;
            var depth = 0;
            while (inner is not null)
            {
                controllerLogger.LogError("InnerException[{Depth}]: {Type} — {Msg}", depth, inner.GetType().FullName, inner.Message);
                controllerLogger.LogError("InnerException[{Depth}].StackTrace: {Stack}", depth, inner.StackTrace);
                inner = inner.InnerException;
                depth++;
            }
            MappingExtensions.LogMaterializationError(controllerLogger, ex, "HeritageController.Create");
            return ApiResponse.Error(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing heritage site.
    /// </summary>
    /// <returns>Updated heritage site details</returns>
    [Authorize(Roles = "MANAGER")]
    [HttpPut("{id:minlength(1)}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] HeritageRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToArray();
            return ApiResponse.Error("Validation failed.", errors);
        }

        try
        {
            var item = await service.UpdateAsync(id, request);
            if (item is null) return ApiResponse.NotFound("Heritage item not found.");
            logs.Log(User, "UPDATE", "Heritage", repository.FindHeritage(id)?.HeritageId, item.Code);
            return ApiResponse.Success(item, "Heritage updated successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponse.Error(ex.Message);
        }
    }

    /// <summary>
    /// Duplicate an existing heritage site, creating a new independent record.
    /// </summary>
    /// <param name="id">The public ID of the heritage site to duplicate (e.g., h001).</param>
    /// <returns>The newly created heritage site details</returns>
    [Authorize(Roles = "MANAGER")]
    [HttpPost("{id:minlength(1)}/duplicate")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Duplicate([FromRoute] string id)
    {
        try
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var item = await service.DuplicateAsync(id, userId);
            if (item is null) return ApiResponse.NotFound("Heritage item not found.");
            logs.Log(User, "DUPLICATE", "Heritage", repository.FindHeritage(item.Id)?.HeritageId, item.Code);
            return ApiResponse.Success(item, "Heritage duplicated successfully.", StatusCodes.Status201Created);
        }
        catch (InvalidOperationException ex)
        {
            controllerLogger.LogError(ex, "InvalidOperationException in HeritageController.Duplicate: {Msg}", ex.Message);
            return ApiResponse.Error(ex.Message);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            controllerLogger.LogError(ex, "DbUpdateException in HeritageController.Duplicate: {Msg}", ex.Message);
            return ApiResponse.Error("Duplicate failed: the copy conflicts with existing data.", null, StatusCodes.Status409Conflict);
        }
        catch (Exception ex)
        {
            controllerLogger.LogError(ex, "Unexpected error in HeritageController.Duplicate: {Msg}", ex.Message);
            return ApiResponse.Error("Duplicate failed.", null, StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Soft delete a heritage site (marks as deleted).
    /// </summary>
    [Authorize(Roles = "MANAGER")]
    [HttpDelete("{id:minlength(1)}")]
    [ValidateAntiForgeryToken]
    public IActionResult Delete([FromRoute] string id)
    {
        var entityId = repository.FindHeritage(id)?.HeritageId;
        if (!service.Delete(id)) return ApiResponse.NotFound("Heritage item not found.");
        logs.Log(User, "DELETE", "Heritage", entityId, id);
        return ApiResponse.Success(null, "Heritage deleted successfully.");
    }
}
