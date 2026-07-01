using Microsoft.EntityFrameworkCore;
using VanDinh.API.Configuration;
using VanDinh.API.Data;
using VanDinh.API.Models;
using VanDinh.API.Services;

namespace VanDinh.API.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context, IPasswordHasher passwordHasher, IConfiguration configuration)
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

        // Seed default users (idempotent — by username)
        var seedAdmin = configuration.GetSection("SeedAdmin").Get<SeedAdminOptions>();

        var defaultUsers = new[]
        {
            new
            {
                Username = seedAdmin?.Username ?? "admin",
                Password = seedAdmin?.Password ?? "Admin@123",
                RoleName = "ADMIN",
                FullName = seedAdmin?.FullName ?? "System Administrator",
                Email = seedAdmin?.Email ?? "admin@vandinh.gov.vn"
            },
            new
            {
                Username = "manager",
                Password = "Manager@123",
                RoleName = "MANAGER",
                FullName = "Heritage Manager",
                Email = "manager@vandinh.gov.vn"
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
        var adminUser = context.Users.First(u => u.Username == adminUsername);

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
                Title = "Gioi thieu Xa Van Dinh",
                Content = "Noi dung gioi thieu se duoc cap nhat tai day.",
                UpdatedBy = adminUser.UserId,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }
    }
}
