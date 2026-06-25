using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class HeritageCategoryConfiguration : IEntityTypeConfiguration<HeritageCategory>
{
    public void Configure(EntityTypeBuilder<HeritageCategory> builder)
    {
        builder.ToTable("HeritageCategories");
        builder.HasKey(x => x.CategoryId);
        builder.Property(x => x.CategoryId).ValueGeneratedOnAdd();
        builder.Property(x => x.Code).HasColumnType("nvarchar(30)").IsRequired();
        builder.Property(x => x.NameVi).HasColumnType("nvarchar(100)").IsRequired();
        builder.Property(x => x.NameEn).HasColumnType("nvarchar(100)").IsRequired();
        builder.Property(x => x.IconUrl).HasColumnType("nvarchar(255)");
        builder.HasIndex(x => x.Code).IsUnique();
    }
}
