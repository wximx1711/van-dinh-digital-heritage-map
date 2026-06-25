using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class IntangibleHeritageConfiguration : IEntityTypeConfiguration<IntangibleHeritage>
{
    public void Configure(EntityTypeBuilder<IntangibleHeritage> builder)
    {
        builder.ToTable("IntangibleHeritage");
        builder.HasKey(x => x.IntangibleId);
        builder.Property(x => x.IntangibleId).ValueGeneratedOnAdd();
        builder.Property(x => x.PublicId).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.NameVi).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.NameEn).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.Category).HasColumnType("nvarchar(30)").IsRequired();
        builder.Property(x => x.DescriptionVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.DescriptionEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ImageUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.VideoUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.IsDeleted).HasColumnType("bit").HasDefaultValue(false);
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");

        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.PublicId).IsUnique();

        builder.HasCheckConstraint("CK_IntangibleHeritage_Category",
            "Category IN ('festival', 'performance', 'craft', 'ritual', 'story')");
    }
}
