using System.ComponentModel.DataAnnotations;

namespace VanDinh.API.DTOs;

/// <summary>Request to submit a public satisfaction evaluation (kiosk / QR terminal).</summary>
public sealed record EvaluationSubmitRequest(
    [Required, RegularExpression(@"^(service|heritage|intangible)$", ErrorMessage = "TargetType must be service, heritage or intangible.")]
    string TargetType,

    [MaxLength(50)]
    string? TargetId,

    [Required, Range(1, 5, ErrorMessage = "Score must be between 1 and 5.")]
    int Score,

    [MaxLength(1000)]
    string? Comment,

    [MaxLength(150)]
    string? DeviceName);

/// <summary>Stored evaluation record.</summary>
public sealed record EvaluationDto(
    long Id,
    string TargetType,
    string? TargetId,
    int Score,
    string? Comment,
    DateTime CreatedAt,
    string? DeviceName);

/// <summary>Summary numbers for an evaluation scope.</summary>
public sealed record EvaluationSummaryDto(
    int TotalEvaluations,
    double AverageScore,
    double SatisfactionRate,
    int TodayCount,
    int MonthCount);

/// <summary>Single rating bucket (score 1..5) with its share.</summary>
public sealed record EvaluationRatingDistributionItem(int Score, int Count, double Percentage);

/// <summary>One month in the monthly trend series.</summary>
public sealed record EvaluationTrendItem(string Month, int Count, double AverageScore);

/// <summary>Ranked heritage/intangible item with rating aggregates.</summary>
public sealed record EvaluationTopItem(string Id, string NameVi, string NameEn, double AverageScore, int EvaluationCount);

/// <summary>Full statistics payload consumed by the admin dashboard.</summary>
public sealed record EvaluationStatsDto(
    EvaluationSummaryDto Summary,
    IReadOnlyList<EvaluationRatingDistributionItem> RatingDistribution,
    IReadOnlyList<EvaluationTrendItem> MonthlyTrend,
    IReadOnlyList<EvaluationTopItem> TopHeritages,
    IReadOnlyList<EvaluationTopItem> LowestHeritages,
    IReadOnlyList<EvaluationTopItem> TopIntangible,
    IReadOnlyList<EvaluationTopItem> LowestIntangible);

/// <summary>Statistics scoped to a single target type (heritage / intangible).</summary>
public sealed record EvaluationTypeStatsDto(
    EvaluationSummaryDto Summary,
    IReadOnlyList<EvaluationRatingDistributionItem> RatingDistribution,
    IReadOnlyList<EvaluationTrendItem> MonthlyTrend,
    IReadOnlyList<EvaluationTopItem> Top,
    IReadOnlyList<EvaluationTopItem> Lowest);

/// <summary>Statistics for a single evaluated target (detail page display).</summary>
public sealed record EvaluationTargetStatsDto(
    string TargetType,
    string TargetId,
    int TotalEvaluations,
    double AverageScore,
    IReadOnlyList<EvaluationRatingDistributionItem> RatingDistribution,
    IReadOnlyList<EvaluationTrendItem> MonthlyTrend,
    IReadOnlyList<EvaluationCommentDto> RecentComments);

/// <summary>Single comment shown on detail pages.</summary>
public sealed record EvaluationCommentDto(long Id, int Score, string? Comment, DateTime CreatedAt);
