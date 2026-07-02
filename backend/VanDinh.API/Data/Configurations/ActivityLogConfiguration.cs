using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> builder)
    {
        builder.ToTable("ActivityLogs");
        builder.HasKey(x => x.LogId);
        builder.Property(x => x.LogId).ValueGeneratedOnAdd();
        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.Action).HasColumnType("nvarchar(50)").IsRequired();
        builder.Property(x => x.EntityName).HasColumnType("nvarchar(100)").IsRequired();
        builder.Property(x => x.EntityId);
        builder.Property(x => x.Description).HasColumnType("nvarchar(max)");
        builder.Property(x => x.IpAddress).HasColumnType("nvarchar(45)");
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.EntityName);
    }
}
