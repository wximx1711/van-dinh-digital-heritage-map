using Microsoft.EntityFrameworkCore;
using VanDinh.API.Data.Configurations;
using VanDinh.API.Models;

namespace VanDinh.API.Data;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<HeritageCategory> HeritageCategories => Set<HeritageCategory>();
    public DbSet<Heritage> Heritage => Set<Heritage>();
    public DbSet<HeritageImage> HeritageImages => Set<HeritageImage>();
    public DbSet<HeritageVideo> HeritageVideos => Set<HeritageVideo>();
    public DbSet<HeritageDocument> HeritageDocuments => Set<HeritageDocument>();
    public DbSet<IntangibleHeritage> IntangibleHeritages => Set<IntangibleHeritage>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<AboutPage> AboutPages => Set<AboutPage>();
    public DbSet<AboutPageHistory> AboutPageHistories => Set<AboutPageHistory>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<MonthlyUpdate> MonthlyUpdates => Set<MonthlyUpdate>();
    public DbSet<RelatedLink> RelatedLinks => Set<RelatedLink>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new RoleConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new HeritageCategoryConfiguration());
        modelBuilder.ApplyConfiguration(new HeritageConfiguration());
        modelBuilder.ApplyConfiguration(new HeritageImageConfiguration());
        modelBuilder.ApplyConfiguration(new HeritageVideoConfiguration());
        modelBuilder.ApplyConfiguration(new HeritageDocumentConfiguration());
        modelBuilder.ApplyConfiguration(new IntangibleHeritageConfiguration());
        modelBuilder.ApplyConfiguration(new AboutPageConfiguration());
        modelBuilder.ApplyConfiguration(new AboutPageHistoryConfiguration());
        modelBuilder.ApplyConfiguration(new ActivityLogConfiguration());
        modelBuilder.ApplyConfiguration(new SystemSettingConfiguration());
        modelBuilder.ApplyConfiguration(new MonthlyUpdateConfiguration());
        modelBuilder.ApplyConfiguration(new RelatedLinkConfiguration());
    }
}
