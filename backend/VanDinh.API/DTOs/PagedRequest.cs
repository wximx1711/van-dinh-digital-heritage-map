namespace VanDinh.API.DTOs;

/// <summary>
/// Represents a paginated result set with metadata.
/// </summary>
/// <typeparam name="T">The type of data items in the result.</typeparam>
public sealed record PagedResult<T>(
    IReadOnlyList<T> Data,
    int Page,
    int PageSize,
    int TotalRecords,
    int TotalPages)
{
    /// <summary>
    /// Creates a paged result from a queryable source.
    /// </summary>
    public static PagedResult<T> Create(IQueryable<T> query, int page, int pageSize)
    {
        var totalRecords = query.Count();
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);
        var data = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PagedResult<T>(data, page, pageSize, totalRecords, totalPages);
    }
}

/// <summary>
/// Pagination parameters for list endpoints.
/// </summary>
public sealed class PagedRequest
{
    /// <summary>
    /// Current page number (1-based).
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of items per page (1-100).
    /// </summary>
    public int PageSize { get; set; } = 10;

    /// <summary>
    /// Validates and normalizes pagination parameters.
    /// </summary>
    public (int Page, int PageSize) Normalize()
    {
        Page = Math.Max(1, Page);
        PageSize = Math.Clamp(PageSize, 1, 100);
        return (Page, PageSize);
    }
}
