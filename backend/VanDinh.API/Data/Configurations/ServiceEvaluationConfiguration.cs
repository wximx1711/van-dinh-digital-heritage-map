using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class ServiceEvaluationConfiguration : IEntityTypeConfiguration<ServiceEvaluation>
{
    public void Configure(EntityTypeBuilder<ServiceEvaluation> builder)
    {
        builder.ToTable("ServiceEvaluations", t =>
        {
            t.HasCheckConstraint("CK_ServiceEvaluation_TargetType",
                "TargetType IN ('service', 'heritage', 'intangible')");
            t.HasCheckConstraint("CK_ServiceEvaluation_Score",
                "Score BETWEEN 1 AND 5");
        });
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.Property(x => x.TargetType).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.TargetId).HasColumnType("nvarchar(50)");
        builder.Property(x => x.Score).IsRequired();
        builder.Property(x => x.Comment).HasColumnType("nvarchar(1000)");
        builder.Property(x => x.DeviceName).HasColumnType("nvarchar(150)");
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.HasIndex(x => x.TargetType);
        builder.HasIndex(x => new { x.TargetType, x.TargetId });
        builder.HasIndex(x => x.CreatedAt);
    }
}
