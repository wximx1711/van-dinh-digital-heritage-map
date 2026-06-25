using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class HeritageDocumentConfiguration : IEntityTypeConfiguration<HeritageDocument>
{
    public void Configure(EntityTypeBuilder<HeritageDocument> builder)
    {
        builder.ToTable("HeritageDocuments");
        builder.HasKey(x => x.DocumentId);
        builder.Property(x => x.DocumentId).ValueGeneratedOnAdd();
        builder.Property(x => x.FileName).HasColumnType("nvarchar(255)");
        builder.Property(x => x.FileUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.FileType).HasColumnType("nvarchar(20)");
        builder.Property(x => x.FileSize).HasColumnType("bigint");
        builder.Property(x => x.UploadedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne<Heritage>()
            .WithMany(h => h.Documents)
            .HasForeignKey(x => x.HeritageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.HeritageId);
    }
}
