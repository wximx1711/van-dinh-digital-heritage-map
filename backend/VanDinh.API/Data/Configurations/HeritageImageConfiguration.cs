using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class HeritageImageConfiguration : IEntityTypeConfiguration<HeritageImage>
{
    public void Configure(EntityTypeBuilder<HeritageImage> builder)
    {
        builder.ToTable("HeritageImages");
        builder.HasKey(x => x.ImageId);
        builder.Property(x => x.ImageId).ValueGeneratedOnAdd();
        builder.Property(x => x.ImageUrl).HasColumnType("nvarchar(500)").IsRequired();
        builder.Property(x => x.Caption).HasColumnType("nvarchar(255)");
        builder.Property(x => x.SortOrder).HasDefaultValue(0);
        builder.Property(x => x.UploadedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne<Heritage>()
            .WithMany(h => h.Images)
            .HasForeignKey(x => x.HeritageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.HeritageId);
    }
}
