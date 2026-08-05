using System.ComponentModel.DataAnnotations;

namespace VanDinh.API.DTOs;

/// <summary>Request to submit a public satisfaction evaluation (kiosk / QR terminal / detail page).</summary>
public sealed record EvaluationSubmitRequest(
    [Required, RegularExpression(@"^(service|heritage|intangible)$", ErrorMessage = "TargetType must be service, heritage or intangible.")]
    string TargetType,

    [MaxLength(50)]
    string? TargetId,

    [Required, Range(1, 5, ErrorMessage = "Score must be between 1 and 5.")]
    int Score,

    [RegularExpression(@"^(very_satisfied|satisfied|neutral|unsatisfied|very_unsatisfied)$", ErrorMessage = "SatisfactionLevel must be very_satisfied, satisfied, neutral, unsatisfied or very_unsatisfied.")]
    string? SatisfactionLevel,

    [MaxLength(200)]
    string? Title,

    [MaxLength(1000)]
    string? Comment,

    [MaxLength(150)]
    string? ReviewerName,

    [MaxLength(254), EmailAddress(ErrorMessage = "Email must be a valid email address.")]
    string? Email,

    [MaxLength(150)]
    string? DeviceName);

/// <summary>Stored evaluation record.</summary>
public sealed record EvaluationDto(
    long Id,
    string TargetType,
    string? TargetId,
    int Score,
    string? SatisfactionLevel,
    string? Title,
    string? Comment,
    string? ReviewerName,
    string? Email,
    string Status,
    bool IsApproved,
    string? AdminReply,
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
public sealed record EvaluationCommentDto(
    long Id,
    int Score,
    string? Title,
    string? Comment,
    string? ReviewerName,
    string? AdminReply,
    DateTime CreatedAt);

/// <summary>Row in the admin evaluation management list.</summary>
public sealed record EvaluationListItemDto(
    long Id,
    string TargetType,
    string? TargetId,
    string? HeritageNameVi,
    string? HeritageNameEn,
    int Score,
    string? SatisfactionLevel,
    string? Title,
    string? Comment,
    string? ReviewerName,
    string? Email,
    string Status,
    bool IsApproved,
    string? AdminReply,
    DateTime CreatedAt);

/// <summary>Full detail of a single evaluation for the admin review dialog.</summary>
public sealed record EvaluationDetailDto(
    long Id,
    string TargetType,
    string? TargetId,
    string? HeritageNameVi,
    string? HeritageNameEn,
    int Score,
    string? SatisfactionLevel,
    string? Title,
    string? Comment,
    string? ReviewerName,
    string? Email,
    string Status,
    bool IsApproved,
    string? AdminReply,
    DateTime CreatedAt,
    string? DeviceName);

/// <summary>Search / filter / sort / pagination request for the admin evaluation list.</summary>
public sealed class EvaluationSearchRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    /// <summary>Free text matched against heritage name, reviewer name and comment.</summary>
    public string? Search { get; set; }

    /// <summary>"heritage" or "intangible".</summary>
    public string? TargetType { get; set; }

    /// <summary>Public ID of a single heritage/intangible item.</summary>
    public string? TargetId { get; set; }

    /// <summary>Filter by star score (1-5).</summary>
    public int? Rating { get; set; }

    /// <summary>Filter by satisfaction level.</summary>
    public string? SatisfactionLevel { get; set; }

    /// <summary>"pending", "approved" or "rejected".</summary>
    public string? Status { get; set; }

    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }

    /// <summary>"createdAt", "score", "status" or "heritage".</summary>
    public string? SortBy { get; set; }

    /// <summary>"asc" or "desc".</summary>
    public string? SortDirection { get; set; }
}

/// <summary>Request body for replying to an evaluation.</summary>
public sealed record EvaluationReplyRequest(
    [Required, MaxLength(1000)]
    string AdminReply);

/// <summary>Moderation counters for the evaluation management page.</summary>
public sealed record EvaluationAdminStatsDto(
    int TotalEvaluations,
    double AverageScore,
    double SatisfactionRate,
    int PendingCount,
    int ApprovedCount,
    int RejectedCount,
    int TodayCount);

/// <summary>Average rating and review count of one heritage/intangible item (management lists).</summary>
public sealed record HeritageEvaluationSummaryDto(
    string TargetType,
    string TargetId,
    string NameVi,
    string NameEn,
    double AverageScore,
    int TotalEvaluations);
