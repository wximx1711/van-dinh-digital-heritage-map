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

    [Required, MinLength(6)]
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
    [Required, MinLength(6)]
    string NewPassword);

public sealed record UpdateRoleRequest([Required] string RoleName);

public sealed record UpdateStatusRequest(bool Status);

/// <summary>Heritage category data transfer object.</summary>
public sealed record HeritageCategoryDto(int CategoryId, string Code, string NameVi, string NameEn, string? IconUrl);

/// <summary>Request to create or update a heritage category.</summary>
public sealed record HeritageCategoryRequest(
    [Required, MaxLength(30)] string Code,
    [Required, MaxLength(100)] string NameVi,
    [Required, MaxLength(100)] string NameEn,
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

    double? Latitude = null,

    double? Longitude = null,

    string[]? ImageUrls = null);

/// <summary>Intangible heritage data transfer object.</summary>
public sealed record IntangibleHeritageDto(
    string Id, string NameVi, string NameEn, string Category,
    string? DescriptionVi, string? DescriptionEn,
    string? Image, string? VideoUrl,
    string CreatedAt, string? UpdatedAt,
    string? OtherNames, string? Location, string? CulturalSpace,
    string? Community, string? RepresentativePersons,
    string? Origin, string? OriginEn, string? FormationHistory, string? HistoricalDevelopment,
    string? WorshipObjects, string? FestivalTime, string? FestivalDuration,
    string? FestivalLocation, string? RitualParticipants, string? RitualProcess,
    string? CustomsAndOfferings, string? FolkGames, string? TraditionalPerformances,
    string? RitualObjects, string? RelatedDocuments, string? RelatedDocumentsEn,
    string? ExistingArtisans, string? TeachingArtisans, string? Practitioners,
    string? Learners, string? OtherHumanResources, string? TransmissionMethod,
    string? CurrentStatus, string? CurrentStatusEn,
    string? ThreatLevel, string? RiskDescription,
    string? HeritageValue, string? HeritageValueEn,
    string? ExistingProtectionMeasures, string? ProposedProtectionMeasures,
    IReadOnlyList<string>? GalleryImages);

public sealed record IntangibleHeritageRequest(
    [Required, StringLength(200, MinimumLength = 5)]
    string NameVi,

    [Required, StringLength(200, MinimumLength = 5)]
    string NameEn,

    [Required, RegularExpression(@"^(knowledge|festival|belief|craft)$")]
    string Category,

    string? DescriptionVi,

    string? DescriptionEn,

    [Required]
    string? Image,

    [RegularExpression(@"^(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.*)?$",
        ErrorMessage = "Only YouTube URLs are accepted for video.")]
    string? VideoUrl,

    string? OtherNames = null,
    string? Location = null,
    string? CulturalSpace = null,
    string? Community = null,
    string? RepresentativePersons = null,
    string? Origin = null,
    string? OriginEn = null,
    string? FormationHistory = null,
    string? HistoricalDevelopment = null,
    string? WorshipObjects = null,
    string? FestivalTime = null,
    string? FestivalDuration = null,
    string? FestivalLocation = null,
    string? RitualParticipants = null,
    string? RitualProcess = null,
    string? CustomsAndOfferings = null,
    string? FolkGames = null,
    string? TraditionalPerformances = null,
    string? RitualObjects = null,
    string? RelatedDocuments = null,
    string? RelatedDocumentsEn = null,
    string? ExistingArtisans = null,
    string? TeachingArtisans = null,
    string? Practitioners = null,
    string? Learners = null,
    string? OtherHumanResources = null,
    string? TransmissionMethod = null,
    string? CurrentStatus = null,
    string? CurrentStatusEn = null,
    string? ThreatLevel = null,
    string? RiskDescription = null,
    string? HeritageValue = null,
    string? HeritageValueEn = null,
    string? ExistingProtectionMeasures = null,
    string? ProposedProtectionMeasures = null,
    string[]? GalleryImages = null);

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
    string TitleVi,
    string TitleEn,
    string IntroductionVi,
    string IntroductionEn,
    string MainContentVi,
    string MainContentEn,
    string? BannerImage,
    string? ContactInfo,
    DateTime UpdatedAt);

public sealed record AboutPageRequest(
    [Required, StringLength(200, MinimumLength = 5)] string TitleVi,
    [Required, StringLength(200, MinimumLength = 5)] string TitleEn,
    [Required] string IntroductionVi,
    [Required] string IntroductionEn,
    [Required] string MainContentVi,
    [Required] string MainContentEn,
    string? BannerImage,
    string? ContactInfo);

/// <summary>Activity log data transfer object.</summary>
public sealed record ActivityLogDto(long LogId, long UserId, string? Username, string? RoleName, string? Action, string? EntityName, long? EntityId, string? Description, string? IpAddress, DateTime CreatedAt);

/// <summary>System settings data transfer object.</summary>
public sealed record SystemSettingDto(int SettingId, string? WebsiteName, string? LogoUrl, string? FooterText, string? ContactEmail, string? Phone, string? Address, string? FacebookUrl, string? TiktokUrl, string? YoutubeUrl);

/// <summary>Request to update system settings.</summary>
public sealed record SystemSettingRequest(string? WebsiteName, string? LogoUrl, string? FooterText, string? ContactEmail, string? Phone, string? Address, string? FacebookUrl, string? TiktokUrl, string? YoutubeUrl);

/// <summary>
/// File upload result.
/// </summary>
public sealed record UploadResult(string Url, string FileName, long Size);

/// <summary>
/// Unified media item for the media library.
/// </summary>
public sealed record MediaItemDto(
    long Id,
    string Url,
    string FileName,
    long FileSize,
    string MediaType,
    DateTime UploadedAt,
    int UsageCount,
    IReadOnlyList<string> HeritageNames);

/// <summary>
/// Search request for the media library.
/// </summary>
public sealed record MediaSearchRequest(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    string? MediaType = null,
    string? UsageFilter = null,
    string? SortBy = "uploadedAt",
    string? SortDirection = "desc");

/// <summary>Contact message data transfer object.</summary>
public sealed record ContactMessageDto(
    long Id, string FullName, string Email, string? Subject, string Message,
    DateTime CreatedAt, bool IsRead, DateTime? ReadAt, string? IPAddress, string? UserAgent);

/// <summary>Contact message list item (without full message body for performance).</summary>
public sealed record ContactMessageListItem(
    long Id, string FullName, string Email, string? Subject,
    DateTime CreatedAt, bool IsRead, DateTime? ReadAt);

/// <summary>Request to search/filter contact messages.</summary>
public sealed record ContactMessageSearchRequest(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? Status = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null);

/// <summary>Bulk operation request.</summary>
public sealed record ContactMessageBulkRequest(long[] Ids);

/// <summary>Related link data transfer object.</summary>
public sealed record RelatedLinkDto(int LinkId, string Title, string Url, int DisplayOrder, bool IsEnabled, DateTime CreatedAt);

/// <summary>Request to create or update a related link.</summary>
public sealed record RelatedLinkRequest(
    [Required, StringLength(200, MinimumLength = 1)] string Title,
    [Required, StringLength(500)] string Url,
    int DisplayOrder,
    bool IsEnabled);
