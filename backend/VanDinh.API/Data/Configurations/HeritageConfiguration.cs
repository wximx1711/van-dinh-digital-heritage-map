using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class HeritageConfiguration : IEntityTypeConfiguration<Heritage>
{
    public void Configure(EntityTypeBuilder<Heritage> builder)
    {
        builder.ToTable("Heritage", t =>
        {
            t.HasCheckConstraint("CK_Heritage_Classification",
                "Classification IN ('national', 'city', 'unranked')");
            t.HasCheckConstraint("CK_Heritage_Status",
                "Status IN ('active', 'maintenance', 'closed')");
            t.HasCheckConstraint("CK_Heritage_NameVi_NotEmpty",
                "LEN(TRIM(NameVi)) >= 5");
            t.HasCheckConstraint("CK_Heritage_NameEn_NotEmpty",
                "LEN(TRIM(NameEn)) >= 5");
            t.HasCheckConstraint("CK_Heritage_DescriptionVi_MinLength",
                "DescriptionVi IS NULL OR LEN(TRIM(DescriptionVi)) >= 30");
            t.HasCheckConstraint("CK_Heritage_DescriptionEn_MinLength",
                "DescriptionEn IS NULL OR LEN(TRIM(DescriptionEn)) >= 30");
            t.HasCheckConstraint("CK_Heritage_HistoryVi_MinLength",
                "HistoryVi IS NULL OR LEN(TRIM(HistoryVi)) >= 50");
            t.HasCheckConstraint("CK_Heritage_HistoryEn_MinLength",
                "HistoryEn IS NULL OR LEN(TRIM(HistoryEn)) >= 50");
            t.HasCheckConstraint("CK_Heritage_AddressVi_MinLength",
                "AddressVi IS NULL OR LEN(TRIM(AddressVi)) >= 5");
            t.HasCheckConstraint("CK_Heritage_AddressEn_MinLength",
                "AddressEn IS NULL OR LEN(TRIM(AddressEn)) >= 5");
        });
        builder.HasKey(x => x.HeritageId);
        builder.Property(x => x.HeritageId).ValueGeneratedOnAdd();
        builder.Property(x => x.PublicId).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.Code).HasColumnType("nvarchar(50)").IsRequired();
        builder.Property(x => x.NameVi).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.NameEn).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.Slug).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.Classification).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.Status).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.AddressVi).HasColumnType("nvarchar(500)");
        builder.Property(x => x.AddressEn).HasColumnType("nvarchar(500)");
        builder.Property(x => x.Latitude).HasColumnType("decimal(10,8)");
        builder.Property(x => x.Longitude).HasColumnType("decimal(11,8)");
        builder.Property(x => x.DescriptionVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.DescriptionEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.HistoryVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.HistoryEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ThumbnailUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.YearBuilt).HasColumnType("nvarchar(100)");
        builder.Property(x => x.Guardian).HasColumnType("nvarchar(255)");
        builder.Property(x => x.QrCodeUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.GoogleMapUrl).HasColumnType("nvarchar(1000)");
        builder.Property(x => x.IsDeleted).HasColumnType("bit").HasDefaultValue(false);
        builder.Property(x => x.DeletedAt).HasColumnType("datetime2");
        builder.Property(x => x.CreatedBy).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");

        builder.HasOne<HeritageCategory>()
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.CreatedBy);
        builder.HasIndex(x => x.Classification);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.IsDeleted);
        builder.HasIndex(x => x.PublicId).IsUnique();
        builder.HasIndex(x => x.Code);
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.NameVi).IsUnique().HasFilter("IsDeleted = 0");
        builder.HasIndex(x => x.NameEn).IsUnique().HasFilter("IsDeleted = 0");
        builder.HasIndex(x => x.GoogleMapUrl).IsUnique().HasFilter("GoogleMapUrl IS NOT NULL AND IsDeleted = 0");


    }
}
