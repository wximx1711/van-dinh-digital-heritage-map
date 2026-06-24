using System.ComponentModel.DataAnnotations;

namespace VanDinh.API.DTOs;

public sealed record LoginRequest([Required] string Username, [Required] string Password, bool RememberMe);
public sealed record LoginResponse(long UserId, string Username, string? FullName, string RoleName);

public sealed record UserDto(long UserId, string Username, string? FullName, string? Email, string RoleName, bool Status);
public sealed record UserCreateRequest(
    [Required, MaxLength(50)] string Username,
    [Required, MinLength(6)] string Password,
    [Required] string RoleName,
    string? FullName,
    [EmailAddress] string? Email);
public sealed record UserUpdateRequest(string RoleName, string? FullName, [EmailAddress] string? Email, bool Status);
public sealed record ResetPasswordRequest([Required, MinLength(6)] string NewPassword);

public sealed record HeritageCategoryDto(int CategoryId, string Code, string NameVi, string NameEn, string? IconUrl);
public sealed record HeritageCategoryRequest(
    [Required, MaxLength(30)] string Code,
    [Required, MaxLength(100)] string NameVi,
    [Required, MaxLength(100)] string NameEn,
    string? IconUrl);

public sealed record HeritageImageDto(long ImageId, string ImageUrl, string? Caption, int SortOrder);
public sealed record HeritageVideoDto(long VideoId, string? Title, string? VideoType, string? VideoUrl, string? ThumbnailUrl);
public sealed record HeritageDocumentDto(long DocumentId, string? FileName, string? FileUrl, string? FileType, long? FileSize);

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
    [Required] string NameVi,
    [Required] string NameEn,
    [Required] string Type,
    [Required] string Classification,
    [Required] string Status,
    string? AddressVi,
    string? AddressEn,
    decimal? Lat,
    decimal? Lon,
    string? DescriptionVi,
    string? DescriptionEn,
    string? HistoryVi,
    string? HistoryEn,
    string? Image,
    string? YearBuilt,
    string? Guardian);

public sealed record IntangibleHeritageDto(string Id, string NameVi, string NameEn, string Category, string? DescriptionVi, string? DescriptionEn, string? Image, string? VideoUrl);
public sealed record IntangibleHeritageRequest([Required] string NameVi, [Required] string NameEn, [Required] string Category, string? DescriptionVi, string? DescriptionEn, string? Image, string? VideoUrl);

public sealed record AboutPageDto(int AboutId, string? Title, string? Content, string? BannerImage, DateTime UpdatedAt);
public sealed record AboutPageRequest(string? Title, string? Content, string? BannerImage);

public sealed record ActivityLogDto(long LogId, long UserId, string? Username, string? Action, string? EntityName, long? EntityId, string? Description, DateTime CreatedAt);
public sealed record SystemSettingDto(int SettingId, string? WebsiteName, string? LogoUrl, string? FooterText, string? ContactEmail, string? Phone, string? Address, string? FacebookUrl, string? TiktokUrl);
public sealed record SystemSettingRequest(string? WebsiteName, string? LogoUrl, string? FooterText, string? ContactEmail, string? Phone, string? Address, string? FacebookUrl, string? TiktokUrl);
public sealed record StatisticsDto(int TotalHeritage, int National, int City, int Unranked, int Intangible, IReadOnlyDictionary<string, int> ByType, IReadOnlyDictionary<string, int> ByStatus);
public sealed record UploadResult(string Url, string FileName, long Size);
