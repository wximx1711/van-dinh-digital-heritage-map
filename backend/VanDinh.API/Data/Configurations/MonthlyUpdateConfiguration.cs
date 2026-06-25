using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class MonthlyUpdateConfiguration : IEntityTypeConfiguration<MonthlyUpdate>
{
    public void Configure(EntityTypeBuilder<MonthlyUpdate> builder)
    {
        builder.ToTable("MonthlyUpdates");
        builder.HasKey(x => x.UpdateId);
        builder.Property(x => x.UpdateId).ValueGeneratedOnAdd();
        builder.Property(x => x.MonthLabel).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.DisplayVi).HasColumnType("nvarchar(50)").IsRequired();
        builder.Property(x => x.DisplayEn).HasColumnType("nvarchar(50)").IsRequired();
        builder.Property(x => x.UpdateCount).HasDefaultValue(0);
    }
}
