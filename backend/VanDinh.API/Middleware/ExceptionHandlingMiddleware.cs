using System.Text.Json;
using Microsoft.Data.SqlClient;

namespace VanDinh.API.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _env;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public ExceptionHandlingMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            if (_env.IsDevelopment())
            {
                await WriteDevelopmentResponse(context, ex);
            }
            else
            {
                await WriteProductionResponse(context);
            }
        }
    }

    private static async Task WriteDevelopmentResponse(HttpContext context, Exception ex)
    {
        var traceId = context.TraceIdentifier;
        var sqlEx = UnwrapSqlException(ex);

        var response = new
        {
            type = ex.GetType().FullName,
            message = ex.Message,
            innerException = ex.InnerException?.ToString(),
            sqlErrorNumber = sqlEx?.Number,
            sqlErrorMessage = sqlEx?.Message,
            stackTrace = ex.ToString(),
            traceId
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }

    private static async Task WriteProductionResponse(HttpContext context)
    {
        var response = new
        {
            message = "An unexpected error occurred. Please try again later."
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }

    private static SqlException? UnwrapSqlException(Exception ex)
    {
        var current = ex;
        while (current is not null)
        {
            if (current is SqlException sqlEx)
                return sqlEx;
            current = current.InnerException;
        }
        return null;
    }
}
