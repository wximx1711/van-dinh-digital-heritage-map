using Microsoft.EntityFrameworkCore;
using VanDinh.API.Configuration;
using VanDinh.API.Data;
using VanDinh.API.Models;
using VanDinh.API.Services;

namespace VanDinh.API.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context, IPasswordHasher passwordHasher, IConfiguration configuration, bool recreateDatabase = false)
    {
        if (recreateDatabase)
        {
            await context.Database.EnsureDeletedAsync();
        }

        await context.Database.MigrateAsync();

        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { RoleName = "ADMIN" },
                new Role { RoleName = "MANAGER" },
                new Role { RoleName = "VISITOR" }
            );
            await context.SaveChangesAsync();
        }

        var seedAdmin = configuration.GetSection("SeedAdmin").Get<SeedAdminOptions>();
        if (!context.Users.Any() &&
            !string.IsNullOrWhiteSpace(seedAdmin?.Username) &&
            !string.IsNullOrWhiteSpace(seedAdmin.Password))
        {
            var adminRole = context.Roles.First(r => r.RoleName == "ADMIN");
            context.Users.Add(new User
            {
                RoleId = adminRole.RoleId,
                Username = seedAdmin.Username,
                PasswordHash = passwordHasher.Hash(seedAdmin.Password),
                FullName = seedAdmin.FullName,
                Email = seedAdmin.Email,
                Status = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        await context.SaveChangesAsync();
    }
}
