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
    [Required, MaxLength(50)]
    public string Username { get; set; } = "";
    [Required, MaxLength(255)]
    public string PasswordHash { get; set; } = "";
    public string? FullName { get; set; }
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
    [Required, MaxLength(255)]
    public string NameVi { get; set; } = "";
    [Required, MaxLength(255)]
    public string NameEn { get; set; } = "";
    [Required, MaxLength(255)]
    public string Slug { get; set; } = "";
    [Required]
    public string Classification { get; set; } = "unranked";
    [Required]
    public string Status { get; set; } = "active";
    public string? AddressVi { get; set; }
    public string? AddressEn { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? DescriptionVi { get; set; }
    public string? DescriptionEn { get; set; }
    public string? HistoryVi { get; set; }
    public string? HistoryEn { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? YearBuilt { get; set; }
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
    public string PublicId { get; set; } = "";
    public string NameVi { get; set; } = "";
    public string NameEn { get; set; } = "";
    public string Category { get; set; } = "";
    public string? DescriptionVi { get; set; }
    public string? DescriptionEn { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public sealed class AboutPage
{
    public int AboutId { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? BannerImage { get; set; }
    public long UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class ActivityLog
{
    public long LogId { get; set; }
    public long UserId { get; set; }
    [Required, MaxLength(50)]
    public string Action { get; set; } = "";
    [Required, MaxLength(100)]
    public string EntityName { get; set; } = "";
    public long? EntityId { get; set; }
    public string? Description { get; set; }
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
