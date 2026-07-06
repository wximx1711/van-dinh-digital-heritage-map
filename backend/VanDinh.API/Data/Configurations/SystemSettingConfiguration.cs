using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
{
    public void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        builder.ToTable("SystemSettings");
        builder.HasKey(x => x.SettingId);
        builder.Property(x => x.SettingId).ValueGeneratedOnAdd();
        builder.Property(x => x.WebsiteName).HasColumnType("nvarchar(255)");
        builder.Property(x => x.LogoUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.FooterText).HasColumnType("nvarchar(500)");
        builder.Property(x => x.ContactEmail).HasColumnType("nvarchar(255)");
        builder.Property(x => x.Phone).HasColumnType("nvarchar(50)");
        builder.Property(x => x.Address).HasColumnType("nvarchar(255)");
        builder.Property(x => x.FacebookUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.TiktokUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.YoutubeUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.UpdatedBy);
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UpdatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.UpdatedBy);
    }
}
