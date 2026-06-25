using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class AboutPageConfiguration : IEntityTypeConfiguration<AboutPage>
{
    public void Configure(EntityTypeBuilder<AboutPage> builder)
    {
        builder.ToTable("AboutPage");
        builder.HasKey(x => x.AboutId);
        builder.Property(x => x.AboutId).ValueGeneratedOnAdd();
        builder.Property(x => x.Title).HasColumnType("nvarchar(255)");
        builder.Property(x => x.Content).HasColumnType("nvarchar(max)");
        builder.Property(x => x.BannerImage).HasColumnType("nvarchar(500)");
        builder.Property(x => x.UpdatedBy).IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UpdatedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
