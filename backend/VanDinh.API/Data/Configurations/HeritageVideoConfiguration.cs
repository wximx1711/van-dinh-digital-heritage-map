using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class HeritageVideoConfiguration : IEntityTypeConfiguration<HeritageVideo>
{
    public void Configure(EntityTypeBuilder<HeritageVideo> builder)
    {
        builder.ToTable("HeritageVideos");
        builder.HasKey(x => x.VideoId);
        builder.Property(x => x.VideoId).ValueGeneratedOnAdd();
        builder.Property(x => x.Title).HasColumnType("nvarchar(255)");
        builder.Property(x => x.VideoType).HasColumnType("nvarchar(20)");
        builder.Property(x => x.VideoUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.ThumbnailUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.UploadedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne<Heritage>()
            .WithMany(h => h.Videos)
            .HasForeignKey(x => x.HeritageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.HeritageId);
    }
}
