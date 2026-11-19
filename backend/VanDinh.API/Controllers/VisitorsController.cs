using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanDinh.API.Data;
using VanDinh.API.Responses;

namespace VanDinh.API.Controllers;

/// <summary>
/// Tracks and provides statistics on website visitors.
/// </summary>
[ApiController]
[Route("api/visitors")]
public sealed class VisitorsController(ApplicationDbContext db) : ControllerBase
{
    // Mốc số lượt truy cập ban đầu để trang web xã luôn uy tín và trang trọng
    private const int BaseCount = 2580;

    private static bool _tableEnsured;
    private static readonly object _tableLock = new();

    private void EnsureTable()
    {
        if (_tableEnsured) return;
        lock (_tableLock)
        {
            if (_tableEnsured) return;
            try
            {
                db.Database.ExecuteSqlRaw(@"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VisitorStats')
                    BEGIN
                        CREATE TABLE [VisitorStats] (
                            [Id] BIGINT IDENTITY(1,1) PRIMARY KEY,
                            [IpAddress] NVARCHAR(50) NULL,
                            [UserAgent] NVARCHAR(MAX) NULL,
                            [Path] NVARCHAR(250) NULL,
                            [VisitedAt] DATETIME2(7) NOT NULL DEFAULT (SYSUTCDATETIME())
                        );
                        CREATE NONCLUSTERED INDEX [IX_VisitorStats_VisitedAt] ON [VisitorStats]([VisitedAt]);
                    END
                ");
                _tableEnsured = true;
            }
            catch
            {
                // Ignored if table already exists or concurrent creation
            }
        }
    }

    /// <summary>
    /// Records a new visitor pageview.
    /// </summary>
    [HttpPost("track")]
    public async Task<IActionResult> Track([FromBody] TrackRequest? req)
    {
        EnsureTable();
        try
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var ua = Request.Headers.UserAgent.ToString() ?? "";
            var path = string.IsNullOrWhiteSpace(req?.Path) ? "/" : req.Path.Trim();

            await db.Database.ExecuteSqlRawAsync(
                "INSERT INTO [VisitorStats] ([IpAddress], [UserAgent], [Path], [VisitedAt]) VALUES ({0}, {1}, {2}, SYSUTCDATETIME())",
                new object[] { ip, ua, path }
            );
            return ApiResponse.Success(new { tracked = true });
        }
        catch (Exception ex)
        {
            return ApiResponse.Success(new { tracked = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Gets visitor statistics (total, today, unique).
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        EnsureTable();
        try
        {
            var conn = db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT 
                    COUNT(*) AS TotalCount,
                    COUNT(DISTINCT [IpAddress]) AS UniqueCount,
                    SUM(CASE WHEN [VisitedAt] >= CAST(GETUTCDATE() AS DATE) THEN 1 ELSE 0 END) AS TodayCount
                FROM [VisitorStats]
            ";

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var total = reader.IsDBNull(0) ? 0 : Convert.ToInt32(reader[0]);
                var unique = reader.IsDBNull(1) ? 0 : Convert.ToInt32(reader[1]);
                var today = reader.IsDBNull(2) ? 0 : Convert.ToInt32(reader[2]);

                return ApiResponse.Success(new
                {
                    totalVisits = BaseCount + total,
                    realVisits = total,
                    uniqueVisitors = Math.Max(1, unique),
                    todayVisits = Math.Max(1, today)
                });
            }
        }
        catch
        {
            // Fallback gracefully
        }

        return ApiResponse.Success(new
        {
            totalVisits = BaseCount,
            realVisits = 0,
            uniqueVisitors = 1,
            todayVisits = 1
        });
    }
}

public sealed record TrackRequest(string? Path);
