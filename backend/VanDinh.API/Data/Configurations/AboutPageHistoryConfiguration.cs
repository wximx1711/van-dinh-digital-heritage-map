using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class AboutPageHistoryConfiguration : IEntityTypeConfiguration<AboutPageHistory>
{
    public void Configure(EntityTypeBuilder<AboutPageHistory> builder)
    {
        builder.ToTable("AboutPageHistories");
        builder.HasKey(x => x.HistoryId);
        builder.Property(x => x.HistoryId).ValueGeneratedOnAdd();
        builder.Property(x => x.AboutId).IsRequired();
        builder.Property(x => x.TitleVi).HasColumnType("nvarchar(200)");
        builder.Property(x => x.TitleEn).HasColumnType("nvarchar(200)");
        builder.Property(x => x.IntroductionVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.IntroductionEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.MainContentVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.MainContentEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.BannerImage).HasColumnType("nvarchar(500)");
        builder.Property(x => x.ContactInfo).HasColumnType("nvarchar(max)");
        builder.Property(x => x.UpdatedBy).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UpdatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.AboutId);
        builder.HasIndex(x => x.UpdatedBy);
    }
}
