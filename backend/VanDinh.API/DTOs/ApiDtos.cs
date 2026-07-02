using System.ComponentModel.DataAnnotations;

namespace VanDinh.API.DTOs;

/// <summary>
/// Login request with username and password.
/// </summary>
public sealed record LoginRequest(
    /// <summary>Username of the user.</summary>
    [Required] string Username,

    /// <summary>User password.</summary>
    [Required] string Password,

    /// <summary>Whether to persist the login session (Remember Me).</summary>
    bool RememberMe);

/// <summary>Login response containing user identity and role.</summary>
public sealed record LoginResponse(long UserId, string Username, string? FullName, string RoleName);

/// <summary>User data transfer object for display.</summary>
public sealed record UserDto(long UserId, string Username, string? FullName, string? Email, string RoleName, bool Status, DateTime CreatedAt);

/// <summary>Request to create a new user account.</summary>
public sealed record UserCreateRequest(
    /// <summary>Username (3-50 characters).</summary>
    [Required, MaxLength(50)] string Username,

    /// <summary>Password (minimum 6 characters).</summary>
    [Required, MinLength(6)] string Password,

    /// <summary>Role name (ADMIN or MANAGER).</summary>
    [Required] string RoleName,

    /// <summary>Full display name.</summary>
    string? FullName,

    /// <summary>Email address.</summary>
    [EmailAddress] string? Email);

/// <summary>Request to update an existing user.</summary>
public sealed record UserUpdateRequest(string RoleName, string? FullName, [EmailAddress] string? Email, bool Status);

/// <summary>Request to reset user password.</summary>
public sealed record ResetPasswordRequest([Required, MinLength(6)] string NewPassword);

/// <summary>Request to update user role.</summary>
public sealed record UpdateRoleRequest([Required] string RoleName);

/// <summary>Request to update user status.</summary>
public sealed record UpdateStatusRequest(bool Status);

/// <summary>Heritage category data transfer object.</summary>
public sealed record HeritageCategoryDto(int CategoryId, string Code, string NameVi, string NameEn, string? IconUrl);

/// <summary>Request to create or update a heritage category.</summary>
public sealed record HeritageCategoryRequest(
    /// <summary>Category code (unique identifier).</summary>
    [Required, MaxLength(30)] string Code,

    /// <summary>Category name in Vietnamese.</summary>
    [Required, MaxLength(100)] string NameVi,

    /// <summary>Category name in English.</summary>
    [Required, MaxLength(100)] string NameEn,

    /// <summary>URL to category icon image.</summary>
    string? IconUrl);

/// <summary>Heritage image data transfer object.</summary>
public sealed record HeritageImageDto(long ImageId, string ImageUrl, string? Caption, int SortOrder);

/// <summary>Heritage video data transfer object.</summary>
public sealed record HeritageVideoDto(long VideoId, string? Title, string? VideoType, string? VideoUrl, string? ThumbnailUrl);

/// <summary>Heritage document data transfer object.</summary>
public sealed record HeritageDocumentDto(long DocumentId, string? FileName, string? FileUrl, string? FileType, long? FileSize);

/// <summary>Complete heritage site data transfer object.</summary>
public sealed record HeritageDto(
    string Id,
    string Code,
    string NameVi,
    string NameEn,
    string Type,
    string Classification,
    string Status,
    string? AddressVi,
    string? AddressEn,
    double? Lat,
    double? Lon,
    string? DescriptionVi,
    string? DescriptionEn,
    string? HistoryVi,
    string? HistoryEn,
    string? Image,
    IReadOnlyList<string> Images,
    string UpdatedAt,
    string? YearBuilt,
    string? Guardian,
    string? QrCodeUrl,
    string? GoogleMapUrl);

/// <summary>Request to create or update a heritage site.</summary>
public sealed record HeritageRequest(
    /// <summary>Heritage site code (unique).</summary>
    [Required, MaxLength(50)] string Code,

    /// <summary>Name in Vietnamese.</summary>
    [Required] string NameVi,

    /// <summary>Name in English.</summary>
    [Required] string NameEn,

    /// <summary>Category type (e.g., dinh, chua, den).</summary>
    [Required] string Type,

    /// <summary>Classification level (national, city, or unranked).</summary>
    [Required] string Classification,

    /// <summary>Current status (active, maintenance, or closed).</summary>
    [Required] string Status,

    /// <summary>Address in Vietnamese.</summary>
    string? AddressVi,

    /// <summary>Address in English.</summary>
    string? AddressEn,

    /// <summary>Google Maps URL for the heritage location.</summary>
    [Url] string? GoogleMapUrl,

    /// <summary>Description in Vietnamese.</summary>
    string? DescriptionVi,

    /// <summary>Description in English.</summary>
    string? DescriptionEn,

    /// <summary>Historical information in Vietnamese.</summary>
    string? HistoryVi,

    /// <summary>Historical information in English.</summary>
    string? HistoryEn,

    /// <summary>Thumbnail image URL.</summary>
    string? Image,

    /// <summary>Year the site was built.</summary>
    string? YearBuilt,

    /// <summary>Organization or person responsible for the heritage.</summary>
    string? Guardian);

/// <summary>Intangible heritage data transfer object.</summary>
public sealed record IntangibleHeritageDto(string Id, string NameVi, string NameEn, string Category, string? DescriptionVi, string? DescriptionEn, string? Image, string? VideoUrl, string CreatedAt, string? UpdatedAt);

/// <summary>Request to create or update intangible heritage.</summary>
public sealed record IntangibleHeritageRequest(
    /// <summary>Name in Vietnamese.</summary>
    [Required] string NameVi,

    /// <summary>Name in English.</summary>
    [Required] string NameEn,

    /// <summary>Category (festival, performance, craft, ritual, or story).</summary>
    [Required] string Category,

    /// <summary>Description in Vietnamese.</summary>
    string? DescriptionVi,

    /// <summary>Description in English.</summary>
    string? DescriptionEn,

    /// <summary>Image URL.</summary>
    string? Image,

    /// <summary>Video URL.</summary>
    string? VideoUrl);

/// <summary>About page data transfer object.</summary>
public sealed record AboutPageDto(int AboutId, string? Title, string? Content, string? BannerImage, DateTime UpdatedAt);

/// <summary>Request to update the about page.</summary>
public sealed record AboutPageRequest(string? Title, string? Content, string? BannerImage);

/// <summary>Activity log data transfer object.</summary>
public sealed record ActivityLogDto(long LogId, long UserId, string? Username, string? RoleName, string? Action, string? EntityName, long? EntityId, string? Description, string? IpAddress, DateTime CreatedAt);

/// <summary>System settings data transfer object.</summary>
public sealed record SystemSettingDto(int SettingId, string? WebsiteName, string? LogoUrl, string? FooterText, string? ContactEmail, string? Phone, string? Address, string? FacebookUrl, string? TiktokUrl);

/// <summary>Request to update system settings.</summary>
public sealed record SystemSettingRequest(string? WebsiteName, string? LogoUrl, string? FooterText, string? ContactEmail, string? Phone, string? Address, string? FacebookUrl, string? TiktokUrl);

/// <summary>Statistics response with heritage counts and breakdowns.</summary>
public sealed record StatisticsDto(int TotalHeritage, int National, int City, int Unranked, IReadOnlyDictionary<string, int> ByType, IReadOnlyDictionary<string, int> ByStatus);

/// <summary>
/// File upload result.
/// </summary>
public sealed record UploadResult(string Url, string FileName, long Size);

/// <summary>Monthly update statistics for charts.</summary>
public sealed record MonthlyUpdateDto(int UpdateId, string MonthLabel, string DisplayVi, string DisplayEn, int UpdateCount);

/// <summary>Request to create or update a monthly update entry.</summary>
public sealed record MonthlyUpdateRequest(
    [Required, MaxLength(20)] string MonthLabel,
    [Required, MaxLength(50)] string DisplayVi,
    [Required, MaxLength(50)] string DisplayEn,
    int UpdateCount);
