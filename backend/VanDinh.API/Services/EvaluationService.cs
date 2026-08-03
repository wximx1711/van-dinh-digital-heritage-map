using Microsoft.EntityFrameworkCore;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services;

public interface IEvaluationService
{
    Task<EvaluationDto> SubmitAsync(EvaluationSubmitRequest request);
    Task<EvaluationStatsDto> GetStatsAsync(DateTime? startDate, DateTime? endDate);
    Task<EvaluationTypeStatsDto> GetTypeStatsAsync(string targetType, DateTime? startDate, DateTime? endDate);
    Task<EvaluationTargetStatsDto> GetTargetStatsAsync(string targetType, string targetId, DateTime? startDate, DateTime? endDate, int page, int pageSize);
}

/// <summary>
/// Aggregates public satisfaction evaluations.
/// All summary numbers are computed by the database (SQL GROUP BY / aggregate
/// functions) — no evaluation rows are materialized in application memory.
/// </summary>
public sealed class EvaluationService(IAppRepository repository) : IEvaluationService
{
    private const string TargetService = "service";
    private const string TargetHeritage = "heritage";
    private const string TargetIntangible = "intangible";

    private static readonly string[] ValidTargets = [TargetService, TargetHeritage, TargetIntangible];

    private sealed record TargetName(string PublicId, string NameVi, string NameEn);

    private sealed record TypeAggregates(
        EvaluationSummaryDto Summary,
        IReadOnlyList<EvaluationRatingDistributionItem> Distribution,
        IReadOnlyList<EvaluationTrendItem> Trend,
        IReadOnlyList<EvaluationTopItem> Top,
        IReadOnlyList<EvaluationTopItem> Lowest);

    public async Task<EvaluationDto> SubmitAsync(EvaluationSubmitRequest request)
    {
        if (request.Score is < 1 or > 5)
            throw new InvalidOperationException("Score must be between 1 and 5.");

        if (!ValidTargets.Contains(request.TargetType))
            throw new InvalidOperationException("TargetType must be service, heritage or intangible.");

        var targetId = string.IsNullOrWhiteSpace(request.TargetId) ? null : request.TargetId.Trim();

        if (request.TargetType == TargetService)
        {
            if (targetId is not null)
                throw new InvalidOperationException("TargetId must be empty when evaluating the public service.");
        }
        else
        {
            if (targetId is null)
                throw new InvalidOperationException($"TargetId is required when evaluating {request.TargetType}.");

            var exists = request.TargetType == TargetHeritage
                ? repository.FindHeritage(targetId) is not null
                : repository.FindIntangible(targetId) is not null;

            if (!exists)
                throw new InvalidOperationException("The evaluated heritage item does not exist.");
        }

        var entity = repository.AddEvaluation(new ServiceEvaluation
        {
            TargetType = request.TargetType,
            TargetId = targetId,
            Score = request.Score,
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim(),
            DeviceName = string.IsNullOrWhiteSpace(request.DeviceName) ? null : request.DeviceName.Trim(),
        });

        return new EvaluationDto(entity.Id, entity.TargetType, entity.TargetId, entity.Score, entity.Comment, entity.CreatedAt, entity.DeviceName);
    }

    public async Task<EvaluationStatsDto> GetStatsAsync(DateTime? startDate, DateTime? endDate)
    {
        var overall = await GetTypeAggregatesAsync(null, startDate, endDate);
        var heritage = await GetTypeAggregatesAsync(TargetHeritage, startDate, endDate);
        var intangible = await GetTypeAggregatesAsync(TargetIntangible, startDate, endDate);

        return new EvaluationStatsDto(
            overall.Summary,
            overall.Distribution,
            overall.Trend,
            heritage.Top,
            heritage.Lowest,
            intangible.Top,
            intangible.Lowest);
    }

    public async Task<EvaluationTypeStatsDto> GetTypeStatsAsync(string targetType, DateTime? startDate, DateTime? endDate)
    {
        if (targetType is not (TargetHeritage or TargetIntangible))
            throw new InvalidOperationException("Target type must be heritage or intangible.");

        var aggregates = await GetTypeAggregatesAsync(targetType, startDate, endDate);

        return new EvaluationTypeStatsDto(
            aggregates.Summary,
            aggregates.Distribution,
            aggregates.Trend,
            aggregates.Top,
            aggregates.Lowest);
    }

    public async Task<EvaluationTargetStatsDto> GetTargetStatsAsync(string targetType, string targetId, DateTime? startDate, DateTime? endDate, int page, int pageSize)
    {
        if (targetType is not (TargetHeritage or TargetIntangible))
            throw new InvalidOperationException("Target type must be heritage or intangible.");

        if (string.IsNullOrWhiteSpace(targetId))
            throw new InvalidOperationException("TargetId is required.");

        var id = targetId.Trim();
        var exists = targetType == TargetHeritage
            ? repository.FindHeritage(id) is not null
            : repository.FindIntangible(id) is not null;

        if (!exists)
            throw new InvalidOperationException("The evaluated item does not exist.");

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var scoped = repository.ServiceEvaluationsUntracked
            .Where(x => x.TargetType == targetType && x.TargetId == id);
        if (startDate.HasValue) scoped = scoped.Where(x => x.CreatedAt >= startDate.Value);
        if (endDate.HasValue) scoped = scoped.Where(x => x.CreatedAt <= endDate.Value);

        var total = await scoped.CountAsync();
        var average = total > 0 ? await scoped.AverageAsync(x => x.Score) : 0;

        var distribution = await scoped
            .GroupBy(x => x.Score)
            .Select(g => new EvaluationRatingDistributionItem(g.Key, g.Count(), 0))
            .ToListAsync();

        var trend = await BuildTrendAsync(scoped);

        var comments = await scoped
            .Where(x => x.Comment != null && x.Comment != "")
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new EvaluationCommentDto(x.Id, x.Score, x.Comment, x.CreatedAt))
            .ToListAsync();

        return new EvaluationTargetStatsDto(
            targetType,
            id,
            total,
            Math.Round(average, 2),
            BuildDistribution(distribution, total),
            trend,
            comments);
    }

    // ── Aggregation core ──────────────────────────────────────────────

    private async Task<TypeAggregates> GetTypeAggregatesAsync(string? targetType, DateTime? startDate, DateTime? endDate)
    {
        var scoped = Scope(repository.ServiceEvaluationsUntracked, startDate, endDate);
        if (targetType is not null)
            scoped = scoped.Where(x => x.TargetType == targetType);

        // Scalar SQL aggregates (COUNT / AVG) — nothing is loaded into memory.
        var total = await scoped.CountAsync();
        var satisfied = await scoped.CountAsync(x => x.Score >= 4);
        var average = total > 0 ? await scoped.AverageAsync(x => x.Score) : 0;

        // "Today" and "this month" are always computed over the full dataset,
        // regardless of the selected report period.
        var (todayStart, tomorrowStart) = LocalDayRange(DateTime.UtcNow);
        var todayCount = await ScopeByType(repository.ServiceEvaluationsUntracked, targetType)
            .CountAsync(x => x.CreatedAt >= todayStart && x.CreatedAt < tomorrowStart);
        var monthStart = todayStart.AddDays(1 - todayStart.Day);
        var nextMonthStart = monthStart.AddMonths(1);
        var monthCount = await ScopeByType(repository.ServiceEvaluationsUntracked, targetType)
            .CountAsync(x => x.CreatedAt >= monthStart && x.CreatedAt < nextMonthStart);

        var distribution = await scoped
            .GroupBy(x => x.Score)
            .Select(g => new EvaluationRatingDistributionItem(g.Key, g.Count(), 0))
            .ToListAsync();

        var trend = await BuildTrendAsync(scoped);

        IReadOnlyList<EvaluationTopItem> top = [];
        IReadOnlyList<EvaluationTopItem> lowest = [];

        if (targetType == TargetHeritage)
        {
            var names = repository.HeritagesUntracked
                .Select(h => new TargetName(h.PublicId, h.NameVi, h.NameEn));
            (top, lowest) = await RankedAsync(scoped.Where(x => x.TargetId != null), names);
        }
        else if (targetType == TargetIntangible)
        {
            var names = repository.IntangibleHeritagesUntracked
                .Select(i => new TargetName(i.PublicId, i.NameVi, i.NameEn));
            (top, lowest) = await RankedAsync(scoped.Where(x => x.TargetId != null), names);
        }

        return new TypeAggregates(
            new EvaluationSummaryDto(total, Math.Round(average, 2), total > 0 ? Math.Round(satisfied * 100d / total, 1) : 0, todayCount, monthCount),
            BuildDistribution(distribution, total),
            trend,
            top,
            lowest);
    }

    private static async Task<IReadOnlyList<EvaluationTrendItem>> BuildTrendAsync(IQueryable<ServiceEvaluation> scoped)
    {
        var trend = await scoped
            .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Count = g.Count(),
                Average = g.Average(x => x.Score)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        return trend
            .Select(x => new EvaluationTrendItem($"{x.Year:0000}-{x.Month:00}", x.Count, Math.Round(x.Average, 2)))
            .ToList();
    }

    private static IQueryable<ServiceEvaluation> ScopeByType(IQueryable<ServiceEvaluation> query, string? targetType)
        => targetType is null ? query : query.Where(x => x.TargetType == targetType);

    private static IQueryable<ServiceEvaluation> Scope(IQueryable<ServiceEvaluation> query, DateTime? startDate, DateTime? endDate)
    {
        if (startDate.HasValue) query = query.Where(x => x.CreatedAt >= startDate.Value);
        if (endDate.HasValue) query = query.Where(x => x.CreatedAt <= endDate.Value);
        return query;
    }

    private static IReadOnlyList<EvaluationRatingDistributionItem> BuildDistribution(
        IReadOnlyList<EvaluationRatingDistributionItem> raw, int total)
    {
        var byScore = raw.ToDictionary(x => x.Score, x => x.Count);
        var items = new List<EvaluationRatingDistributionItem>(5);
        for (var score = 1; score <= 5; score++)
        {
            var count = byScore.GetValueOrDefault(score);
            var pct = total > 0 ? Math.Round(count * 100d / total, 1) : 0;
            items.Add(new EvaluationRatingDistributionItem(score, count, pct));
        }
        return items;
    }

    private static async Task<(IReadOnlyList<EvaluationTopItem> Top, IReadOnlyList<EvaluationTopItem> Lowest)> RankedAsync(
        IQueryable<ServiceEvaluation> scoped,
        IQueryable<TargetName> names)
    {
        // The join is executed inside SQL Server; only the aggregated top/lowest
        // rows are materialized. Include navigations on the name source are
        // ignored by EF Core because the query projects to a plain shape.
        var joined = scoped.Join(
            names,
            e => e.TargetId,
            n => n.PublicId,
            (e, n) => new { e.Score, n.PublicId, n.NameVi, n.NameEn });

        var top = await joined
            .GroupBy(x => new { x.PublicId, x.NameVi, x.NameEn })
            .Select(g => new EvaluationTopItem(g.Key.PublicId, g.Key.NameVi, g.Key.NameEn, g.Average(x => x.Score), g.Count()))
            .OrderByDescending(x => x.AverageScore)
            .ThenByDescending(x => x.EvaluationCount)
            .Take(10)
            .ToListAsync();

        var lowest = await joined
            .GroupBy(x => new { x.PublicId, x.NameVi, x.NameEn })
            .Select(g => new EvaluationTopItem(g.Key.PublicId, g.Key.NameVi, g.Key.NameEn, g.Average(x => x.Score), g.Count()))
            .OrderBy(x => x.AverageScore)
            .ThenByDescending(x => x.EvaluationCount)
            .Take(10)
            .ToListAsync();

        return (top, lowest);
    }

    private static (DateTime Start, DateTime End) LocalDayRange(DateTime utcNow)
    {
        var tz = ResolveLocalTimeZone();
        var localDate = TimeZoneInfo.ConvertTimeFromUtc(utcNow, tz).Date;
        return (localDate, localDate.AddDays(1));
    }

    private static TimeZoneInfo ResolveLocalTimeZone()
    {
        try
        {
            // Vietnam standard time; falls back to server local time when the
            // time zone id is unavailable on the host.
            return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.Local;
        }
    }
}
