using Microsoft.EntityFrameworkCore;
using VanDinh.API.Data;
using VanDinh.API.Models;
using VanDinh.API.Services;

namespace VanDinh.API.Data;

public static class DbInitializer
{
    private const string DefaultAdminPassword = "Admin@123";

    public static async Task InitializeAsync(ApplicationDbContext context, IPasswordHasher passwordHasher, bool recreateDatabase = false)
    {
        if (recreateDatabase)
        {
            await context.Database.EnsureDeletedAsync();
        }

        await context.Database.EnsureCreatedAsync();

        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { RoleName = "ADMIN" },
                new Role { RoleName = "MANAGER" },
                new Role { RoleName = "VISITOR" }
            );
        }

        if (!context.Users.Any())
        {
            var adminRole = context.Roles.First(r => r.RoleName == "ADMIN");
            context.Users.Add(new User
            {
                RoleId = adminRole.RoleId,
                Username = "admin",
                PasswordHash = passwordHasher.Hash(DefaultAdminPassword),
                FullName = "Quan tri vien he thong",
                Email = "admin@vandinh.vn",
                Status = true,
                CreatedAt = DateTime.UtcNow
            });
        }

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
        }

        if (!context.Heritage.Any())
        {
            var categories = context.HeritageCategories.ToDictionary(c => c.Code);
            var adminId = context.Users.First().UserId;
            var seedHeritages = new (string publicId, string code, string catCode, string nameVi, string nameEn, string classification, string status, decimal lat, decimal lon)[]
            {
                ("h001", "VDHN-DT-001", "dinh", "Dinh Van Dinh", "Van Dinh Communal House", "national", "active", 20.756m, 105.853m),
                ("h002", "VDHN-DT-002", "chua", "Chua Boi Khe", "Boi Khe Pagoda", "national", "active", 20.748m, 105.849m),
                ("h003", "VDHN-DT-003", "den", "Den Van Dinh", "Van Dinh Temple", "city", "active", 20.762m, 105.858m),
                ("h004", "VDHN-DT-004", "mieu", "Mieu Thon Giua", "Middle Village Shrine", "unranked", "active", 20.752m, 105.851m),
                ("h005", "VDHN-DT-005", "nhatho", "Nha tho ho Dang", "Dang Clan Ancestral House", "unranked", "active", 20.746m, 105.847m),
                ("h006", "VDHN-DT-006", "chua", "Chua Thanh Dinh", "Thanh Dinh Pagoda", "city", "maintenance", 20.759m, 105.862m),
                ("h007", "VDHN-DT-007", "lang", "Lang Mo Cu Nguyen Van Tho", "Nguyen Van Tho Mausoleum", "unranked", "active", 20.744m, 105.845m),
                ("h008", "VDHN-DT-008", "dinh", "Dinh Huong Tao", "Huong Tao Communal House", "city", "active", 20.765m, 105.864m),
                ("h009", "VDHN-DT-009", "phu", "Phu Van Dinh", "Van Dinh Palace", "unranked", "active", 20.757m, 105.848m),
                ("h010", "VDHN-DT-010", "quan", "Quan Thi Cau", "Thi Cau Taoist Temple", "unranked", "closed", 20.749m, 105.857m)
            };

            foreach (var s in seedHeritages)
            {
                var cat = categories[s.catCode];
                var heritage = new Heritage
                {
                    PublicId = s.publicId,
                    Code = s.code,
                    CategoryId = cat.CategoryId,
                    NameVi = s.nameVi,
                    NameEn = s.nameEn,
                    Slug = Slugify(s.nameEn),
                    Classification = s.classification,
                    Status = s.status,
                    AddressVi = "Xa Van Dinh, Ha Noi",
                    AddressEn = "Van Dinh Commune, Hanoi",
                    Latitude = s.lat,
                    Longitude = s.lon,
                    DescriptionVi = $"{s.nameVi} la mot diem di san cua xa Van Dinh.",
                    DescriptionEn = $"{s.nameEn} is a heritage site in Van Dinh Commune.",
                    HistoryVi = "Thong tin lich su dang duoc cap nhat.",
                    HistoryEn = "Historical information is being updated.",
                    ThumbnailUrl = "https://images.unsplash.com/photo-1571842533456-9b0d746c5a9b?w=800&h=500&fit=crop&auto=format",
                    YearBuilt = "Dang cap nhat",
                    Guardian = "Ban Quan ly Di tich Van Dinh",
                    CreatedBy = adminId,
                    CreatedAt = DateTime.UtcNow
                };
                context.Heritage.Add(heritage);
            }
        }

        if (!context.IntangibleHeritages.Any())
        {
            context.IntangibleHeritages.AddRange(
                new IntangibleHeritage { PublicId = "i001", NameVi = "Le hoi Dinh Van Dinh", NameEn = "Van Dinh Communal House Festival", Category = "festival", DescriptionVi = "Le hoi duoc to chuc hang nam.", DescriptionEn = "Annual festival.", ImageUrl = "https://images.unsplash.com/photo-1765510103179-0c2f628d2ff2?w=800&h=500&fit=crop&auto=format" },
                new IntangibleHeritage { PublicId = "i002", NameVi = "Hat Cheo Van Dinh", NameEn = "Van Dinh Cheo Folk Opera", Category = "performance", DescriptionVi = "Cheo la loai hinh nghe thuat san khau.", DescriptionEn = "Cheo is a folk performance art.", ImageUrl = "https://images.unsplash.com/photo-1727402528763-af11a02966f0?w=800&h=500&fit=crop&auto=format" },
                new IntangibleHeritage { PublicId = "i003", NameVi = "Nghe det lua truyen thong", NameEn = "Traditional Silk Weaving", Category = "craft", DescriptionVi = "Nghe det lua la nghe thu cong.", DescriptionEn = "Silk weaving is a traditional craft.", ImageUrl = "https://images.unsplash.com/photo-1592473858143-790cde951b1a?w=800&h=500&fit=crop&auto=format" },
                new IntangibleHeritage { PublicId = "i004", NameVi = "Le gio to dong ho", NameEn = "Clan Ancestor Commemoration", Category = "ritual", DescriptionVi = "Le gio to the hien dao ly ong nuoc nho nguon.", DescriptionEn = "Clan ancestor commemoration.", ImageUrl = "https://images.unsplash.com/photo-1578409682213-e27b3355cad7?w=800&h=500&fit=crop&auto=format" },
                new IntangibleHeritage { PublicId = "i005", NameVi = "Truyen thuyet Than song Day", NameEn = "Legend of the Day River Spirit", Category = "story", DescriptionVi = "Truyen thuyet ve vi than song.", DescriptionEn = "Legend of the river spirit.", ImageUrl = "https://images.unsplash.com/photo-1758298135151-e1283f571030?w=800&h=500&fit=crop&auto=format" }
            );
        }

        if (!context.AboutPages.Any())
        {
            var adminId = context.Users.First().UserId;
            context.AboutPages.Add(new AboutPage
            {
                Title = "Gioi thieu Xa Van Dinh",
                Content = "Noi dung gioi thieu se duoc cap nhat tai day.",
                UpdatedBy = adminId,
                UpdatedAt = DateTime.UtcNow
            });
        }

        if (!context.SystemSettings.Any())
        {
            var adminId = context.Users.First().UserId;
            context.SystemSettings.Add(new SystemSetting
            {
                WebsiteName = "Ban do so Xa Van Dinh",
                FooterText = "Ban do so Xa Van Dinh",
                ContactEmail = "contact@vandinh.vn",
                Phone = "0123456789",
                Address = "Xa Van Dinh, Thanh pho Ha Noi",
                UpdatedBy = adminId,
                UpdatedAt = DateTime.UtcNow
            });
        }

        if (!context.MonthlyUpdates.Any())
        {
            context.MonthlyUpdates.AddRange(
                new MonthlyUpdate { MonthLabel = "01/2024", DisplayVi = "Thang 1", DisplayEn = "Jan", UpdateCount = 3 },
                new MonthlyUpdate { MonthLabel = "02/2024", DisplayVi = "Thang 2", DisplayEn = "Feb", UpdateCount = 5 },
                new MonthlyUpdate { MonthLabel = "03/2024", DisplayVi = "Thang 3", DisplayEn = "Mar", UpdateCount = 7 },
                new MonthlyUpdate { MonthLabel = "04/2024", DisplayVi = "Thang 4", DisplayEn = "Apr", UpdateCount = 4 },
                new MonthlyUpdate { MonthLabel = "05/2024", DisplayVi = "Thang 5", DisplayEn = "May", UpdateCount = 6 },
                new MonthlyUpdate { MonthLabel = "06/2024", DisplayVi = "Thang 6", DisplayEn = "Jun", UpdateCount = 2 }
            );
        }

        await context.SaveChangesAsync();

        if (!context.HeritageImages.Any())
        {
            var heritages = context.Heritage.ToList();
            var thumbnailUrl = "https://images.unsplash.com/photo-1571842533456-9b0d746c5a9b?w=800&h=500&fit=crop&auto=format";
            foreach (var h in heritages)
            {
                context.HeritageImages.Add(new HeritageImage
                {
                    HeritageId = h.HeritageId,
                    ImageUrl = h.ThumbnailUrl ?? thumbnailUrl,
                    SortOrder = 1,
                    UploadedAt = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();
        }
    }

    private static string Slugify(string value)
    {
        var chars = value.ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
        return string.Join('-', new string(chars).Split('-', StringSplitOptions.RemoveEmptyEntries));
    }
}
