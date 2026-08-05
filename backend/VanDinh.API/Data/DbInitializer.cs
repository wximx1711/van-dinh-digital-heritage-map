using Microsoft.EntityFrameworkCore;
using VanDinh.API.Configuration;
using VanDinh.API.Data;
using VanDinh.API.Models;
using VanDinh.API.Services;

namespace VanDinh.API.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context, IPasswordHasher passwordHasher, IConfiguration configuration, IHostEnvironment environment)
    {
        await context.Database.MigrateAsync();

        // Seed Roles (idempotent)
        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { RoleName = "ADMIN" },
                new Role { RoleName = "MANAGER" }
            );
            await context.SaveChangesAsync();
        }

        // Seed default users (idempotent — by username).
        var seedAdmin = configuration.GetSection("SeedAdmin").Get<SeedAdminOptions>();
        var seedManager = configuration.GetSection("SeedManager").Get<SeedManagerOptions>();

        var adminConfigured = seedAdmin is { Username: not null } && !string.IsNullOrWhiteSpace(seedAdmin.Password);
        var managerConfigured = seedManager is { Username: not null } && !string.IsNullOrWhiteSpace(seedManager.Password);

        // On a fresh Production database the initial credentials MUST come from
        // configuration. Seeding the well-known dev fallbacks here would expose
        // a default admin account (admin/Admin@123 and manager/Manager@123).
        if (!context.Users.Any() && environment.IsProduction())
        {
            if (!adminConfigured)
                throw new InvalidOperationException(
                    "A fresh Production database requires the 'SeedAdmin' configuration section (Username/Password). " +
                    "Set it in appsettings.Production.json or via environment variables, e.g. SeedAdmin__Username / SeedAdmin__Password.");

            if (!managerConfigured)
                throw new InvalidOperationException(
                    "A fresh Production database requires the 'SeedManager' configuration section (Username/Password). " +
                    "Set it in appsettings.Production.json or via environment variables, e.g. SeedManager__Username / SeedManager__Password.");
        }

        var defaultUsers = new[]
        {
            new
            {
                Username = ValueOr(seedAdmin?.Username, "admin"),
                Password = ValueOr(seedAdmin?.Password, "Admin@123"),
                RoleName = "ADMIN",
                FullName = ValueOr(seedAdmin?.FullName, "System Administrator"),
                Email = ValueOr(seedAdmin?.Email, "admin@vandinh.gov.vn")
            },
            new
            {
                Username = ValueOr(seedManager?.Username, "manager"),
                Password = ValueOr(seedManager?.Password, "Manager@123"),
                RoleName = "MANAGER",
                FullName = ValueOr(seedManager?.FullName, "Heritage Manager"),
                Email = ValueOr(seedManager?.Email, "manager@vandinh.gov.vn")
            }
        };

        foreach (var u in defaultUsers)
        {
            if (!context.Users.Any(x => x.Username == u.Username))
            {
                var role = context.Roles.First(r => r.RoleName == u.RoleName);
                context.Users.Add(new User
                {
                    RoleId = role.RoleId,
                    Username = u.Username,
                    PasswordHash = passwordHasher.Hash(u.Password),
                    FullName = u.FullName,
                    Email = u.Email,
                    Status = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        foreach (var user in context.Users.Where(u => !u.PasswordHash.StartsWith("PBKDF2$")).ToList())
        {
            user.PasswordHash = passwordHasher.Hash(user.PasswordHash);
            user.UpdatedAt = DateTime.UtcNow;
        }
        await context.SaveChangesAsync();

        if (!context.HeritageCategories.Any())
        {
            context.HeritageCategories.AddRange(
                new HeritageCategory { Code = "dinh", NameVi = "Dinh", NameEn = "Communal House", IconUrl = "/icons/dinh.png" },
                new HeritageCategory { Code = "chua", NameVi = "Chua", NameEn = "Pagoda", IconUrl = "/icons/chua.png" },
                new HeritageCategory { Code = "den", NameVi = "Den", NameEn = "Temple", IconUrl = "/icons/den.png" },
                new HeritageCategory { Code = "mieu", NameVi = "Mieu", NameEn = "Shrine", IconUrl = "/icons/mieu.png" },
                new HeritageCategory { Code = "phu", NameVi = "Phu", NameEn = "Palace", IconUrl = "/icons/phu.png" },
                new HeritageCategory { Code = "quan", NameVi = "Quan", NameEn = "Taoist Temple", IconUrl = "/icons/quan.png" },
                new HeritageCategory { Code = "nhacu", NameVi = "Nha co", NameEn = "Ancient House", IconUrl = "/icons/nhacu.png" },
                new HeritageCategory { Code = "nhatho", NameVi = "Nha tho ho", NameEn = "Clan House", IconUrl = "/icons/nhatho.png" },
                new HeritageCategory { Code = "lang", NameVi = "Lang mo", NameEn = "Mausoleum", IconUrl = "/icons/lang.png" }
            );
            await context.SaveChangesAsync();
        }

        var adminUsername = seedAdmin?.Username ?? "admin";
        var adminUser = context.Users.FirstOrDefault(u => u.Username == adminUsername) ?? context.Users.First();

        if (!context.SystemSettings.Any())
        {
            context.SystemSettings.Add(new SystemSetting
            {
                WebsiteName = "Ban do so Xa Van Dinh",
                FooterText = "Ban do so Xa Van Dinh",
                ContactEmail = "contact@vandinh.vn",
                Phone = "0123456789",
                Address = "Xa Van Dinh, Thanh pho Ha Noi",
                UpdatedBy = adminUser.UserId,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        if (!context.AboutPages.Any())
        {
            context.AboutPages.Add(new AboutPage
            {
                TitleVi = "Giới thiệu xã Vân Đình",
                TitleEn = "About Van Dinh Commune",
                IntroductionVi = "Hệ thống Bản đồ số Di sản Văn hóa Vân Đình là dự án số hóa và bảo tồn di sản văn hóa của xã Vân Đình, huyện Ứng Hòa, thành phố Hà Nội.",
                IntroductionEn = "The Van Dinh Digital Heritage Map System is a project for digitizing and preserving cultural heritage of Van Dinh Commune, Ung Hoa District, Hanoi City.",
                MainContentVi = "Với tổng số hơn 10 di tích vật thể và 5 di sản phi vật thể được ghi nhận và số hóa, hệ thống cung cấp đầy đủ thông tin lịch sử, kiến trúc, tọa độ và hình ảnh của từng di sản.",
                MainContentEn = "With over 10 tangible heritage sites and 5 intangible heritage items documented and digitized, the system provides comprehensive information on history, architecture, coordinates, and images of each heritage site.",
                UpdatedBy = adminUser.UserId,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Backfill MediaFiles from existing heritage media records
        await BackfillMediaFilesAsync(context);
    }

    private static string ValueOr(string? value, string fallback)
        => string.IsNullOrWhiteSpace(value) ? fallback : value;

    private static async Task BackfillMediaFilesAsync(ApplicationDbContext context)
    {
        var existingUrls = context.MediaFiles.Select(mf => mf.Url).ToHashSet();

        var newMediaFiles = new List<MediaFile>();

        // Images
        foreach (var img in context.HeritageImages.AsNoTracking().ToList())
        {
            if (!existingUrls.Contains(img.ImageUrl))
            {
                newMediaFiles.Add(new MediaFile
                {
                    Url = img.ImageUrl,
                    FileName = Path.GetFileName(img.ImageUrl) ?? img.ImageUrl,
                    FileSize = 0,
                    MediaType = "image",
                    UploadedAt = img.UploadedAt
                });
                existingUrls.Add(img.ImageUrl);
            }
        }

        // Videos
        foreach (var vid in context.HeritageVideos.AsNoTracking().Where(v => v.VideoUrl != null).ToList())
        {
            if (!existingUrls.Contains(vid.VideoUrl!))
            {
                newMediaFiles.Add(new MediaFile
                {
                    Url = vid.VideoUrl!,
                    FileName = vid.Title ?? Path.GetFileName(vid.VideoUrl!) ?? vid.VideoUrl!,
                    FileSize = 0,
                    MediaType = "video",
                    UploadedAt = vid.UploadedAt
                });
                existingUrls.Add(vid.VideoUrl!);
            }
        }

        // Documents
        foreach (var doc in context.HeritageDocuments.AsNoTracking().Where(d => d.FileUrl != null).ToList())
        {
            if (!existingUrls.Contains(doc.FileUrl!))
            {
                newMediaFiles.Add(new MediaFile
                {
                    Url = doc.FileUrl!,
                    FileName = doc.FileName ?? Path.GetFileName(doc.FileUrl!) ?? doc.FileUrl!,
                    FileSize = doc.FileSize ?? 0,
                    MediaType = "document",
                    UploadedAt = doc.UploadedAt
                });
                existingUrls.Add(doc.FileUrl!);
            }
        }

        if (newMediaFiles.Count > 0)
        {
            context.MediaFiles.AddRange(newMediaFiles);
            await context.SaveChangesAsync();
        }
    }
}
