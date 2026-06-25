using Microsoft.AspNetCore.Mvc;

namespace VanDinh.API.Responses;

public static class ApiResponse
{
    public static IActionResult Success(object? data = null, string message = "Operation completed successfully.", int statusCode = StatusCodes.Status200OK)
    {
        return new JsonResult(new { success = true, message, data }) { StatusCode = statusCode };
    }

    public static IActionResult Error(string message, object? errors = null, int statusCode = StatusCodes.Status400BadRequest)
    {
        var errorObj = errors is string s ? new[] { s } : errors ?? Array.Empty<object>();
        return new JsonResult(new { success = false, message, errors = errorObj }) { StatusCode = statusCode };
    }

    public static IActionResult NotFound(string message = "Resource not found.")
    {
        return new JsonResult(new { success = false, message, errors = new[] { "The requested resource was not found." } }) { StatusCode = StatusCodes.Status404NotFound };
    }

    public static IActionResult Unauthorized(string message = "Unauthorized access.")
    {
        return new JsonResult(new { success = false, message, errors = new[] { "Authentication required." } }) { StatusCode = StatusCodes.Status401Unauthorized };
    }

    public static IActionResult Forbidden(string message = "Access denied.")
    {
        return new JsonResult(new { success = false, message, errors = new[] { "You do not have permission to access this resource." } }) { StatusCode = StatusCodes.Status403Forbidden };
    }
}
