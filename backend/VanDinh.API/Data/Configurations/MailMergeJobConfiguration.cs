using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class MailMergeJobConfiguration : IEntityTypeConfiguration<MailMergeJob>
{
    public void Configure(EntityTypeBuilder<MailMergeJob> builder)
    {
        builder.ToTable("MailMergeJobs");
        builder.HasKey(x => x.JobId);
        builder.Property(x => x.JobId).ValueGeneratedOnAdd();
        builder.Property(x => x.PublicId).IsRequired();
        builder.Property(x => x.TemplateFileName).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.ExcelFileName).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.FilenamePattern).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.PlaceholdersJson).HasColumnType("nvarchar(max)");
        builder.Property(x => x.MappingJson).HasColumnType("nvarchar(max)");
        builder.Property(x => x.Status).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.ErrorsJson).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ZipFileName).HasColumnType("nvarchar(255)");
        builder.Property(x => x.CreatedBy).IsRequired();
        builder.Property(x => x.CreatedByUsername).HasColumnType("nvarchar(100)").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(x => x.CompletedAt).HasColumnType("datetime2");

        builder.HasIndex(x => x.PublicId).IsUnique();
        builder.HasIndex(x => x.CreatedBy);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.Status);
    }
}
