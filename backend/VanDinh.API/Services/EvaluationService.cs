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

    // ── Admin moderation ──────────────────────────────────────────────
    Task<PagedResult<EvaluationListItemDto>> SearchAsync(EvaluationSearchRequest request);
    Task<EvaluationDetailDto> GetDetailAsync(long id);
    Task ApproveAsync(long id);
    Task RejectAsync(long id);
    Task ReplyAsync(long id, string adminReply);
    Task DeleteAsync(long id);
    Task<EvaluationAdminStatsDto> GetAdminStatsAsync();
    Task<IReadOnlyList<HeritageEvaluationSummaryDto>> GetHeritageSummariesAsync();
}

/// <summary>
/// Aggregates public satisfaction evaluations.
/// Public-facing numbers (detail pages, overall stats) only count approved
/// evaluations; the moderation list exposes every submission.
/// All summary numbers are computed by the database (SQL GROUP BY / aggregate
/// functions) — no evaluation rows are materialized in application memory.
/// </summary>
public sealed class EvaluationService(IAppRepository repository) : IEvaluationService
{
    private const string TargetService = "service";
    private const string TargetHeritage = "heritage";
    private const string TargetIntangible = "intangible";

    private const string StatusPending = "pending";
    private const string StatusApproved = "approved";
    private const string StatusRejected = "rejected";

    private static readonly string[] ValidTargets = [TargetService, TargetHeritage, TargetIntangible];

    private static readonly string[] ValidSatisfactionLevels =
        ["very_satisfied", "satisfied", "neutral", "unsatisfied", "very_unsatisfied"];

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

        if (!string.IsNullOrWhiteSpace(request.SatisfactionLevel) &&
            !ValidSatisfactionLevels.Contains(request.SatisfactionLevel))
            throw new InvalidOperationException("SatisfactionLevel is invalid.");

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

        // Duplicate prevention: the same reviewer (email) can only submit once per
        // target within 24 hours — stops accidental double-taps and spam resubmits.
        var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        if (email is not null && targetId is not null)
        {
            var windowStart = DateTime.UtcNow.AddHours(-24);
            var duplicate = await repository.ServiceEvaluationsUntracked
                .AnyAsync(x => x.TargetType == request.TargetType && x.TargetId == targetId && x.Email == email && x.CreatedAt >= windowStart);
            if (duplicate)
                throw new InvalidOperationException("Bạn đã đánh giá di tích này trong 24 giờ qua. Cảm ơn bạn đã chia sẻ ý kiến!");
        }

        var entity = repository.AddEvaluation(new ServiceEvaluation
        {
            TargetType = request.TargetType,
            TargetId = targetId,
            Score = request.Score,
            SatisfactionLevel = string.IsNullOrWhiteSpace(request.SatisfactionLevel) ? null : request.SatisfactionLevel.Trim(),
            Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title.Trim(),
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim(),
            ReviewerName = string.IsNullOrWhiteSpace(request.ReviewerName) ? null : request.ReviewerName.Trim(),
            Email = email,
            Status = StatusPending,
            IsApproved = false,
            AdminReply = null,
            DeviceName = string.IsNullOrWhiteSpace(request.DeviceName) ? null : request.DeviceName.Trim(),
        });

        return ToDto(entity);
    }

    // ── Admin moderation ──────────────────────────────────────────────

    public async Task<PagedResult<EvaluationListItemDto>> SearchAsync(EvaluationSearchRequest request)
    {
        var (page, pageSize) = new PagedRequest { Page = request.Page, PageSize = request.PageSize }.Normalize();

        var query = repository.ServiceEvaluationsUntracked;

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(x =>
                (x.Comment != null && x.Comment.ToLower().Contains(s)) ||
                (x.Title != null && x.Title.ToLower().Contains(s)) ||
                (x.ReviewerName != null && x.ReviewerName.ToLower().Contains(s)) ||
                (x.Email != null && x.Email.ToLower().Contains(s)) ||
                (x.TargetId != null && x.TargetId.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(request.TargetType))
            query = query.Where(x => x.TargetType == request.TargetType);

        if (!string.IsNullOrWhiteSpace(request.TargetId))
            query = query.Where(x => x.TargetId == request.TargetId);

        if (request.Rating.HasValue)
            query = query.Where(x => x.Score == request.Rating.Value);

        if (!string.IsNullOrWhiteSpace(request.SatisfactionLevel))
            query = query.Where(x => x.SatisfactionLevel == request.SatisfactionLevel);

        if (!string.IsNullOrWhiteSpace(request.Status))
            query = query.Where(x => x.Status == request.Status);

        if (request.DateFrom.HasValue)
            query = query.Where(x => x.CreatedAt >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(x => x.CreatedAt <= request.DateTo.Value);

        var sortBy = request.SortBy ?? "createdAt";
        var desc = !string.Equals(request.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);
        query = (sortBy, desc) switch
        {
            ("score", false) => query.OrderBy(x => x.Score).ThenByDescending(x => x.Id),
            ("score", true) => query.OrderByDescending(x => x.Score).ThenByDescending(x => x.Id),
            ("status", false) => query.OrderBy(x => x.Status).ThenByDescending(x => x.Id),
            ("status", true) => query.OrderByDescending(x => x.Status).ThenByDescending(x => x.Id),
            ("createdAt", false) => query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id),
            _ => query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id),
        };

        var totalRecords = await query.CountAsync();

        var pageItems = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var heritageNames = await LoadTargetNamesAsync(pageItems);
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

        var items = pageItems
            .Select(x => ToListItemDto(x, heritageNames))
            .ToList();

        return new PagedResult<EvaluationListItemDto>(items, page, pageSize, totalRecords, totalPages);
    }

    public async Task<EvaluationDetailDto> GetDetailAsync(long id)
    {
        var entity = await repository.ServiceEvaluationsUntracked.FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new InvalidOperationException("Evaluation not found.");
        var names = await LoadTargetNamesAsync([entity]);
        return ToDetailDto(entity, names);
    }

    public async Task ApproveAsync(long id)
    {
        var entity = FindTrackedForModeration(id);
        if (entity.Status == StatusApproved) return;
        entity.Status = StatusApproved;
        entity.IsApproved = true;
        repository.UpdateEvaluation(entity);
    }

    public async Task RejectAsync(long id)
    {
        var entity = FindTrackedForModeration(id);
        if (entity.Status == StatusRejected) return;
        entity.Status = StatusRejected;
        entity.IsApproved = false;
        repository.UpdateEvaluation(entity);
    }

    public async Task ReplyAsync(long id, string adminReply)
    {
        var entity = FindTrackedForModeration(id);
        entity.AdminReply = string.IsNullOrWhiteSpace(adminReply) ? null : adminReply.Trim();
        if (entity.Status == StatusPending)
        {
            entity.Status = StatusApproved;
            entity.IsApproved = true;
        }
        repository.UpdateEvaluation(entity);
    }

    public async Task DeleteAsync(long id)
    {
        if (await repository.ServiceEvaluationsUntracked.AnyAsync(x => x.Id == id))
            repository.DeleteEvaluation(id);
    }

    public async Task<EvaluationAdminStatsDto> GetAdminStatsAsync()
    {
        var all = repository.ServiceEvaluationsUntracked;
        var approved = all.Where(x => x.IsApproved);

        var total = await all.CountAsync();
        var pending = await all.CountAsync(x => x.Status == StatusPending);
        var rejected = await all.CountAsync(x => x.Status == StatusRejected);
        var approvedCount = await approved.CountAsync();
        var average = approvedCount > 0 ? await approved.AverageAsync(x => x.Score) : 0;
        var satisfied = await approved.CountAsync(x => x.Score >= 4);
        var (todayStart, tomorrowStart, _, _) = LocalRanges(DateTime.UtcNow);
        var today = await all.CountAsync(x => x.CreatedAt >= todayStart && x.CreatedAt < tomorrowStart);

        return new EvaluationAdminStatsDto(
            total,
            Math.Round(average, 2),
            approvedCount > 0 ? Math.Round(satisfied * 100d / approvedCount, 1) : 0,
            pending,
            approvedCount,
            rejected,
            today);
    }

    public async Task<IReadOnlyList<HeritageEvaluationSummaryDto>> GetHeritageSummariesAsync()
    {
        var approved = repository.ServiceEvaluationsUntracked
            .Where(x => x.IsApproved && x.TargetId != null);

        var heritageAggregates = await approved
            .Where(x => x.TargetType == TargetHeritage)
            .GroupBy(x => x.TargetId!)
            .Select(g => new { Id = g.Key, Average = g.Average(x => x.Score), Count = g.Count() })
            .ToListAsync();

        var intangibleAggregates = await approved
            .Where(x => x.TargetType == TargetIntangible)
            .GroupBy(x => x.TargetId!)
            .Select(g => new { Id = g.Key, Average = g.Average(x => x.Score), Count = g.Count() })
            .ToListAsync();

        var heritageNames = await repository.HeritagesUntracked
            .Where(h => heritageAggregates.Select(a => a.Id).Contains(h.PublicId))
            .Select(h => new TargetName(h.PublicId, h.NameVi, h.NameEn))
            .ToListAsync();

        var intangibleNames = await repository.IntangibleHeritagesUntracked
            .Where(i => intangibleAggregates.Select(a => a.Id).Contains(i.PublicId))
            .Select(i => new TargetName(i.PublicId, i.NameVi, i.NameEn))
            .ToListAsync();

        var results = new List<HeritageEvaluationSummaryDto>();
        foreach (var agg in heritageAggregates)
        {
            var name = heritageNames.FirstOrDefault(n => n.PublicId == agg.Id);
            results.Add(new HeritageEvaluationSummaryDto(
                TargetHeritage, agg.Id,
                name?.NameVi ?? agg.Id, name?.NameEn ?? agg.Id,
                Math.Round(agg.Average, 2), agg.Count));
        }
        foreach (var agg in intangibleAggregates)
        {
            var name = intangibleNames.FirstOrDefault(n => n.PublicId == agg.Id);
            results.Add(new HeritageEvaluationSummaryDto(
                TargetIntangible, agg.Id,
                name?.NameVi ?? agg.Id, name?.NameEn ?? agg.Id,
                Math.Round(agg.Average, 2), agg.Count));
        }
        return results;
    }

    // ── Public statistics (approved only) ────────────────────────────

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
            .Where(x => x.IsApproved && x.TargetType == targetType && x.TargetId == id);
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
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new EvaluationCommentDto(x.Id, x.Score, x.Title, x.Comment, x.ReviewerName, x.AdminReply, x.CreatedAt))
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
        var scoped = Scope(repository.ServiceEvaluationsUntracked, startDate, endDate)
            .Where(x => x.IsApproved);
        if (targetType is not null)
            scoped = scoped.Where(x => x.TargetType == targetType);

        // Scalar SQL aggregates (COUNT / AVG) — nothing is loaded into memory.
        var total = await scoped.CountAsync();
        var satisfied = await scoped.CountAsync(x => x.Score >= 4);
        var average = total > 0 ? await scoped.AverageAsync(x => x.Score) : 0;

        // "Today" and "this month" are always computed over the full dataset,
        // regardless of the selected report period.
        var (todayStart, tomorrowStart, monthStart, nextMonthStart) = LocalRanges(DateTime.UtcNow);
        var todayCount = await ScopeByType(repository.ServiceEvaluationsUntracked, targetType)
            .Where(x => x.IsApproved)
            .CountAsync(x => x.CreatedAt >= todayStart && x.CreatedAt < tomorrowStart);
        var monthCount = await ScopeByType(repository.ServiceEvaluationsUntracked, targetType)
            .Where(x => x.IsApproved)
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
        // Per-target aggregates are computed by the database (SQL GROUP BY) and
        // only the aggregated rows are materialized; the name source is joined
        // in memory afterwards (same pattern as GetHeritageSummariesAsync).
        var aggregates = await scoped
            .Where(x => x.TargetId != null)
            .GroupBy(x => x.TargetId!)
            .Select(g => new { Id = g.Key, Average = g.Average(x => x.Score), Count = g.Count() })
            .ToListAsync();

        var nameLookup = (await names.ToListAsync())
            .ToDictionary(n => n.PublicId);

        var ranked = aggregates
            .Select(a =>
            {
                var name = nameLookup.TryGetValue(a.Id, out var n) ? n : null;
                return new EvaluationTopItem(
                    a.Id,
                    name?.NameVi ?? a.Id,
                    name?.NameEn ?? a.Id,
                    Math.Round(a.Average, 2),
                    a.Count);
            })
            .ToList();

        var top = ranked
            .OrderByDescending(x => x.AverageScore)
            .ThenByDescending(x => x.EvaluationCount)
            .Take(10)
            .ToList();

        var lowest = ranked
            .OrderBy(x => x.AverageScore)
            .ThenByDescending(x => x.EvaluationCount)
            .Take(10)
            .ToList();

        return (top, lowest);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private ServiceEvaluation FindTrackedForModeration(long id)
    {
        var entity = repository.FindEvaluationTracked(id)
            ?? throw new InvalidOperationException("Evaluation not found.");
        return entity;
    }

    private async Task<Dictionary<string, TargetName>> LoadTargetNamesAsync(IEnumerable<ServiceEvaluation> items)
    {
        var itemsList = items.ToList();
        var heritageIds = itemsList.Where(x => x.TargetType == TargetHeritage && x.TargetId != null).Select(x => x.TargetId!).Distinct().ToList();
        var intangibleIds = itemsList.Where(x => x.TargetType == TargetIntangible && x.TargetId != null).Select(x => x.TargetId!).Distinct().ToList();

        var result = new Dictionary<string, TargetName>();
        if (heritageIds.Count > 0)
        {
            foreach (var name in await repository.HeritagesUntracked
                .Where(h => heritageIds.Contains(h.PublicId))
                .Select(h => new TargetName(h.PublicId, h.NameVi, h.NameEn))
                .ToListAsync())
                result[$"{TargetHeritage}:{name.PublicId}"] = name;
        }
        if (intangibleIds.Count > 0)
        {
            foreach (var name in await repository.IntangibleHeritagesUntracked
                .Where(i => intangibleIds.Contains(i.PublicId))
                .Select(i => new TargetName(i.PublicId, i.NameVi, i.NameEn))
                .ToListAsync())
                result[$"{TargetIntangible}:{name.PublicId}"] = name;
        }
        return result;
    }

    private static string? ResolveName(Dictionary<string, TargetName> names, string targetType, string? targetId, bool vi)
    {
        if (targetId is null) return null;
        if (!names.TryGetValue($"{targetType}:{targetId}", out var name)) return null;
        return vi ? name.NameVi : name.NameEn;
    }

    private static EvaluationListItemDto ToListItemDto(ServiceEvaluation x, Dictionary<string, TargetName> names)
        => new(
            x.Id, x.TargetType, x.TargetId,
            ResolveName(names, x.TargetType, x.TargetId, true),
            ResolveName(names, x.TargetType, x.TargetId, false),
            x.Score, x.SatisfactionLevel, x.Title, x.Comment, x.ReviewerName, x.Email,
            x.Status, x.IsApproved, x.AdminReply, x.CreatedAt);

    private static EvaluationDetailDto ToDetailDto(ServiceEvaluation x, Dictionary<string, TargetName> names)
        => new(
            x.Id, x.TargetType, x.TargetId,
            ResolveName(names, x.TargetType, x.TargetId, true),
            ResolveName(names, x.TargetType, x.TargetId, false),
            x.Score, x.SatisfactionLevel, x.Title, x.Comment, x.ReviewerName, x.Email,
            x.Status, x.IsApproved, x.AdminReply, x.CreatedAt, x.DeviceName);

    private static EvaluationDto ToDto(ServiceEvaluation x)
        => new(
            x.Id, x.TargetType, x.TargetId, x.Score, x.SatisfactionLevel, x.Title,
            x.Comment, x.ReviewerName, x.Email, x.Status, x.IsApproved, x.AdminReply,
            x.CreatedAt, x.DeviceName);

    private static (DateTime DayStartUtc, DateTime DayEndUtc, DateTime MonthStartUtc, DateTime NextMonthStartUtc) LocalRanges(DateTime utcNow)
    {
        var tz = ResolveLocalTimeZone();
        var localNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, tz);
        var localDate = localNow.Date;

        var dayStartUtc = TimeZoneInfo.ConvertTimeToUtc(localDate, tz);
        var dayEndUtc = TimeZoneInfo.ConvertTimeToUtc(localDate.AddDays(1), tz);

        var monthStartLocal = new DateTime(localNow.Year, localNow.Month, 1);
        var monthStartUtc = TimeZoneInfo.ConvertTimeToUtc(monthStartLocal, tz);
        var nextMonthStartUtc = TimeZoneInfo.ConvertTimeToUtc(monthStartLocal.AddMonths(1), tz);

        return (dayStartUtc, dayEndUtc, monthStartUtc, nextMonthStartUtc);
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
