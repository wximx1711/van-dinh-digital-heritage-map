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
            t.HasCheckConstraint("CK_ServiceEvaluation_SatisfactionLevel",
                "SatisfactionLevel IS NULL OR SatisfactionLevel IN ('very_satisfied', 'satisfied', 'neutral', 'unsatisfied', 'very_unsatisfied')");
            t.HasCheckConstraint("CK_ServiceEvaluation_Status",
                "Status IN ('pending', 'approved', 'rejected')");
        });
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.Property(x => x.TargetType).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.TargetId).HasColumnType("nvarchar(50)");
        builder.Property(x => x.Score).IsRequired();
        builder.Property(x => x.SatisfactionLevel).HasColumnType("nvarchar(20)");
        builder.Property(x => x.Title).HasColumnType("nvarchar(200)");
        builder.Property(x => x.Comment).HasColumnType("nvarchar(1000)");
        builder.Property(x => x.ReviewerName).HasColumnType("nvarchar(150)");
        builder.Property(x => x.Email).HasColumnType("nvarchar(254)");
        builder.Property(x => x.Status).HasColumnType("nvarchar(20)").IsRequired().HasDefaultValue("pending");
        builder.Property(x => x.IsApproved).HasDefaultValue(false);
        builder.Property(x => x.AdminReply).HasColumnType("nvarchar(1000)");
        builder.Property(x => x.DeviceName).HasColumnType("nvarchar(150)");
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.HasIndex(x => x.TargetType);
        builder.HasIndex(x => new { x.TargetType, x.TargetId });
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAt);
    }
}
