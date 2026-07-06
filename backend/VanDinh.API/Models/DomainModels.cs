using System.ComponentModel.DataAnnotations;

namespace VanDinh.API.Models;

public sealed class Role
{
    public int RoleId { get; set; }
    [Required, MaxLength(50)]
    public string RoleName { get; set; } = "";
}

public sealed class User
{
    public long UserId { get; set; }
    public int RoleId { get; set; }
    [Required, MaxLength(30)]
    [RegularExpression(@"^[a-zA-Z0-9_]+$")]
    public string Username { get; set; } = "";
    [Required, MaxLength(255)]
    public string PasswordHash { get; set; } = "";
    [MaxLength(100)]
    public string? FullName { get; set; }
    [MaxLength(100)]
    public string? Email { get; set; }
    public bool Status { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public Role? Role { get; set; }
}

public sealed class HeritageCategory
{
    public int CategoryId { get; set; }
    [Required, MaxLength(30)]
    public string Code { get; set; } = "";
    [Required, MaxLength(100)]
    public string NameVi { get; set; } = "";
    [Required, MaxLength(100)]
    public string NameEn { get; set; } = "";
    public string? IconUrl { get; set; }
}

public sealed class Heritage
{
    public long HeritageId { get; set; }
    [Required, MaxLength(20)]
    public string PublicId { get; set; } = "";
    [Required, MaxLength(50)]
    public string Code { get; set; } = "";
    public int CategoryId { get; set; }
    [Required, MinLength(5), MaxLength(200)]
    public string NameVi { get; set; } = "";
    [Required, MinLength(5), MaxLength(200)]
    public string NameEn { get; set; } = "";
    [Required, MaxLength(255)]
    public string Slug { get; set; } = "";
    [Required]
    public string Classification { get; set; } = "unranked";
    [Required]
    public string Status { get; set; } = "active";
    [MinLength(5), MaxLength(300)]
    public string? AddressVi { get; set; }
    [MinLength(5), MaxLength(300)]
    public string? AddressEn { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    [MinLength(30)]
    public string? DescriptionVi { get; set; }
    [MinLength(30)]
    public string? DescriptionEn { get; set; }
    [MinLength(50)]
    public string? HistoryVi { get; set; }
    [MinLength(50)]
    public string? HistoryEn { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? YearBuilt { get; set; }
    [MaxLength(150)]
    public string? Guardian { get; set; }
    public string? QrCodeUrl { get; set; }
    public string? GoogleMapUrl { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public long CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public List<HeritageImage> Images { get; set; } = [];
    public List<HeritageVideo> Videos { get; set; } = [];
    public List<HeritageDocument> Documents { get; set; } = [];
}

public sealed class HeritageImage
{
    public long ImageId { get; set; }
    public long HeritageId { get; set; }
    [Required, MaxLength(500)]
    public string ImageUrl { get; set; } = "";
    public string? Caption { get; set; }
    public int SortOrder { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

public sealed class HeritageVideo
{
    public long VideoId { get; set; }
    public long HeritageId { get; set; }
    public string? Title { get; set; }
    public string? VideoType { get; set; }
    public string? VideoUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

public sealed class HeritageDocument
{
    public long DocumentId { get; set; }
    public long HeritageId { get; set; }
    public string? FileName { get; set; }
    public string? FileUrl { get; set; }
    public string? FileType { get; set; }
    public long? FileSize { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

public sealed class IntangibleHeritage
{
    public long IntangibleId { get; set; }
    [Required, MaxLength(20)]
    public string PublicId { get; set; } = "";
    [Required, MinLength(5), MaxLength(200)]
    public string NameVi { get; set; } = "";
    [Required, MinLength(5), MaxLength(200)]
    public string NameEn { get; set; } = "";
    [Required, MaxLength(30)]
    public string Category { get; set; } = "";
    [Required, MinLength(30)]
    public string? DescriptionVi { get; set; }
    [Required, MinLength(30)]
    public string? DescriptionEn { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public bool IsDeleted { get; set; }
    public long CreatedBy { get; set; }
    public long? UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public sealed class AboutPage
{
    public int AboutId { get; set; }
    [Required, StringLength(200, MinimumLength = 5)]
    public string? TitleVi { get; set; }
    [Required, StringLength(200, MinimumLength = 5)]
    public string? TitleEn { get; set; }
    [Required]
    public string? IntroductionVi { get; set; }
    [Required]
    public string? IntroductionEn { get; set; }
    [Required]
    public string? MainContentVi { get; set; }
    [Required]
    public string? MainContentEn { get; set; }
    public string? BannerImage { get; set; }
    public string? ContactInfo { get; set; }
    public long UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class AboutPageHistory
{
    public long HistoryId { get; set; }
    public int AboutId { get; set; }
    public string? TitleVi { get; set; }
    public string? TitleEn { get; set; }
    public string? IntroductionVi { get; set; }
    public string? IntroductionEn { get; set; }
    public string? MainContentVi { get; set; }
    public string? MainContentEn { get; set; }
    public string? BannerImage { get; set; }
    public string? ContactInfo { get; set; }
    public long UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class ActivityLog
{
    public long LogId { get; set; }
    public long UserId { get; set; }
    [MaxLength(50)]
    public string? Action { get; set; }
    [MaxLength(100)]
    public string? EntityName { get; set; }
    public long? EntityId { get; set; }
    public string? Description { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User? User { get; set; }
}

public sealed class SystemSetting
{
    public int SettingId { get; set; }
    public string? WebsiteName { get; set; }
    public string? LogoUrl { get; set; }
    public string? FooterText { get; set; }
    public string? ContactEmail { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? FacebookUrl { get; set; }
    public string? TiktokUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public long? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class MonthlyUpdate
{
    public int UpdateId { get; set; }
    [Required, MaxLength(20)]
    public string MonthLabel { get; set; } = "";
    [Required, MaxLength(50)]
    public string DisplayVi { get; set; } = "";
    [Required, MaxLength(50)]
    public string DisplayEn { get; set; } = "";
    public int UpdateCount { get; set; }
}

public sealed class RelatedLink
{
    public int LinkId { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = "";
    [Required, MaxLength(500)]
    public string Url { get; set; } = "";
    public int DisplayOrder { get; set; }
    public bool IsEnabled { get; set; } = true;
    public long CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public long? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
