namespace VanDinh.API.DTOs;

/// <summary>An Excel column discovered in the uploaded data file.</summary>
public sealed record MailMergeColumnDto(string Name, int Index, string? SampleValue);

/// <summary>Suggested placeholder → Excel column mapping with a confidence level.</summary>
public sealed record MailMergeMappingSuggestionDto(string Placeholder, string? Column, string Confidence);

/// <summary>Result of analyzing a template + data file pair before generation.</summary>
public sealed record MailMergeAnalyzeResponse(
    string TemplateFileName,
    IReadOnlyList<string> Placeholders,
    string ExcelFileName,
    IReadOnlyList<MailMergeColumnDto> Columns,
    IReadOnlyList<MailMergeMappingSuggestionDto> SuggestedMapping,
    IReadOnlyList<IReadOnlyDictionary<string, string>> PreviewRows,
    int RowCount,
    int EmptyRowCount);

/// <summary>Submitted placeholder → column mapping. Serialized as JSON in the multipart form.</summary>
public sealed record MailMergeMappingItem(string Placeholder, string? Column);

/// <summary>Response returned immediately after a generation job is queued.</summary>
public sealed record MailMergeJobCreatedResponse(
    long JobId,
    Guid PublicId,
    string Status,
    string TemplateFileName,
    string ExcelFileName,
    IReadOnlyList<string> Placeholders,
    IReadOnlyList<string> Columns,
    int RowCount,
    string FilenamePattern);

/// <summary>Live progress snapshot of a running or finished generation job.</summary>
public sealed record MailMergeProgressResponse(
    string Status,
    int TotalRows,
    int ProcessedRows,
    int SuccessCount,
    int FailedCount,
    string? CurrentFileName,
    IReadOnlyList<string> Errors,
    DateTime? CompletedAt,
    string? ZipFileName);

/// <summary>History list item.</summary>
public sealed record MailMergeHistoryItemDto(
    long JobId,
    Guid PublicId,
    string TemplateFileName,
    string ExcelFileName,
    string FilenamePattern,
    int TotalRows,
    int SuccessCount,
    int FailedCount,
    string Status,
    string UserName,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    string? ZipFileName);

/// <summary>Full history detail including the persisted error list.</summary>
public sealed record MailMergeHistoryDetailDto(
    long JobId,
    Guid PublicId,
    string TemplateFileName,
    string ExcelFileName,
    string FilenamePattern,
    IReadOnlyList<string> Placeholders,
    IReadOnlyDictionary<string, string> Mapping,
    int TotalRows,
    int SuccessCount,
    int FailedCount,
    string Status,
    string UserName,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    IReadOnlyList<string> Errors,
    string? ZipFileName);
