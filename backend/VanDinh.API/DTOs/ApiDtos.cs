using System.ComponentModel.DataAnnotations;

namespace VanDinh.API.DTOs;

public sealed record LoginRequest(
    [Required] string Username,
    [Required] string Password,
    bool RememberMe);

public sealed record LoginResponse(long UserId, string Username, string? FullName, string RoleName);

public sealed record UserDto(long UserId, string Username, string? FullName, string? Email, string RoleName, bool Status, DateTime CreatedAt);

public sealed record UserCreateRequest(
    [Required, StringLength(30, MinimumLength = 4)]
    [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores.")]
    string Username,

    [Required, MinLength(8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
        ErrorMessage = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.")]
    string Password,

    [Required, RegularExpression(@"^(ADMIN|MANAGER)$", ErrorMessage = "Role must be ADMIN or MANAGER.")]
    string RoleName,

    [Required, StringLength(100, MinimumLength = 5)]
    string? FullName,

    [Required, EmailAddress]
    string? Email);

public sealed record UserUpdateRequest(
    [Required, RegularExpression(@"^(ADMIN|MANAGER)$", ErrorMessage = "Role must be ADMIN or MANAGER.")]
    string RoleName,

    [Required, StringLength(100, MinimumLength = 5)]
    string? FullName,

    [Required, EmailAddress]
    string? Email,

    bool Status);

public sealed record ResetPasswordRequest(
    [Required, MinLength(8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
        ErrorMessage = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.")]
    string NewPassword);

public sealed record UpdateRoleRequest([Required] string RoleName);

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

public sealed record HeritageRequest(
    [Required, MaxLength(50)] string Code,

    [Required, StringLength(200, MinimumLength = 5)]
    string NameVi,

    [Required, StringLength(200, MinimumLength = 5)]
    string NameEn,

    [Required] string Type,

    [Required, RegularExpression(@"^(national|city|unranked)$")]
    string Classification,

    [Required, RegularExpression(@"^(active|maintenance|closed)$")]
    string Status,

    [Required, StringLength(300, MinimumLength = 5)]
    string? AddressVi,

    [Required, StringLength(300, MinimumLength = 5)]
    string? AddressEn,

    [Required]
    [RegularExpression(@"^(https:\/\/(maps\.google|www\.google\.com\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)).*",
        ErrorMessage = "Google Maps URL must start with https://maps.google, https://www.google.com/maps, https://goo.gl/maps, or https://maps.app.goo.gl")]
    string? GoogleMapUrl,

    [Required, MinLength(30)]
    string? DescriptionVi,

    [Required, MinLength(30)]
    string? DescriptionEn,

    [Required, MinLength(50)]
    string? HistoryVi,

    [Required, MinLength(50)]
    string? HistoryEn,

    [Required]
    string? Image,

    [Required]
    [RegularExpression(@"^[1-9]\d{2,3}$",
        ErrorMessage = "Year built must be a valid integer between 100 and current year")]
    string? YearBuilt,

    [MaxLength(150)]
    string? Guardian,

    [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
    double? Latitude = null,

    [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
    double? Longitude = null,

    string[]? ImageUrls = null);

/// <summary>Intangible heritage data transfer object.</summary>
public sealed record IntangibleHeritageDto(string Id, string NameVi, string NameEn, string Category, string? DescriptionVi, string? DescriptionEn, string? Image, string? VideoUrl, string CreatedAt, string? UpdatedAt);

public sealed record IntangibleHeritageRequest(
    [Required, StringLength(200, MinimumLength = 5)]
    string NameVi,

    [Required, StringLength(200, MinimumLength = 5)]
    string NameEn,

    [Required, RegularExpression(@"^(festival|performance|craft|ritual|story)$")]
    string Category,

    [Required, MinLength(30)]
    string? DescriptionVi,

    [Required, MinLength(30)]
    string? DescriptionEn,

    [Required]
    string? Image,

    [RegularExpression(@"^(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.*)?$",
        ErrorMessage = "Only YouTube URLs are accepted for video.")]
    string? VideoUrl);

/// <summary>About page history data transfer object.</summary>
public sealed record AboutPageHistoryDto(
    long HistoryId,
    string? TitleVi,
    string? TitleEn,
    string? IntroductionVi,
    string? IntroductionEn,
    string? MainContentVi,
    string? MainContentEn,
    string? BannerImage,
    string? ContactInfo,
    long UpdatedBy,
    DateTime CreatedAt);

/// <summary>About page data transfer object.</summary>
public sealed record AboutPageDto(
    int AboutId,
    string? TitleVi,
    string? TitleEn,
    string? IntroductionVi,
    string? IntroductionEn,
    string? MainContentVi,
    string? MainContentEn,
    string? BannerImage,
    string? ContactInfo,
    DateTime UpdatedAt);

public sealed record AboutPageRequest(
    [Required, StringLength(200, MinimumLength = 5)] string? TitleVi,
    [Required, StringLength(200, MinimumLength = 5)] string? TitleEn,
    [Required] string? IntroductionVi,
    [Required] string? IntroductionEn,
    [Required] string? MainContentVi,
    [Required] string? MainContentEn,
    string? BannerImage,
    string? ContactInfo);

/// <summary>Activity log data transfer object.</summary>
public sealed record ActivityLogDto(long LogId, long UserId, string? Username, string? RoleName, string? Action, string? EntityName, long? EntityId, string? Description, string? IpAddress, DateTime CreatedAt);

/// <summary>System settings data transfer object.</summary>
public sealed record SystemSettingDto(int SettingId, string? WebsiteName, string? LogoUrl, string? FooterText, string? ContactEmail, string? Phone, string? Address, string? FacebookUrl, string? TiktokUrl, string? YoutubeUrl);

/// <summary>Request to update system settings.</summary>
public sealed record SystemSettingRequest(string? WebsiteName, string? LogoUrl, string? FooterText, string? ContactEmail, string? Phone, string? Address, string? FacebookUrl, string? TiktokUrl, string? YoutubeUrl);

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

/// <summary>Related link data transfer object.</summary>
public sealed record RelatedLinkDto(int LinkId, string Title, string Url, int DisplayOrder, bool IsEnabled, DateTime CreatedAt);

/// <summary>Request to create or update a related link.</summary>
public sealed record RelatedLinkRequest(
    [Required, StringLength(200, MinimumLength = 1)] string Title,
    [Required, StringLength(500)] string Url,
    int DisplayOrder,
    bool IsEnabled);
