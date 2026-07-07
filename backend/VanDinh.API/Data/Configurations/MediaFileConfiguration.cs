using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile>
{
    public void Configure(EntityTypeBuilder<MediaFile> builder)
    {
        builder.ToTable("MediaFiles");
        builder.HasKey(x => x.MediaFileId);
        builder.Property(x => x.MediaFileId).ValueGeneratedOnAdd();
        builder.Property(x => x.Url).HasColumnType("nvarchar(500)").IsRequired();
        builder.Property(x => x.FileName).HasColumnType("nvarchar(255)");
        builder.Property(x => x.FileSize).HasColumnType("bigint");
        builder.Property(x => x.MediaType).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.UploadedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.HasIndex(x => x.Url);
        builder.HasIndex(x => x.MediaType);
    }
}
