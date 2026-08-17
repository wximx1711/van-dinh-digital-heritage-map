using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class MemorialSiteConfiguration : IEntityTypeConfiguration<MemorialSite>
{
    public void Configure(EntityTypeBuilder<MemorialSite> builder)
    {
        builder.ToTable("MemorialSites", t =>
        {
            t.HasCheckConstraint("CK_MemorialSites_Category",
                "Category IN ('memorial', 'victory', 'military_camp', 'secret_base', 'battlefield', 'revolutionary_event', 'other')");
            t.HasCheckConstraint("CK_MemorialSites_Classification",
                "Classification IN ('national', 'provincial', 'city', 'unranked')");
            t.HasCheckConstraint("CK_MemorialSites_Status",
                "Status IN ('active', 'maintenance', 'closed')");
            t.HasCheckConstraint("CK_MemorialSites_NameVi_NotEmpty",
                "LEN(TRIM(NameVi)) >= 5");
            t.HasCheckConstraint("CK_MemorialSites_NameEn_NotEmpty",
                "LEN(TRIM(NameEn)) >= 5");
            t.HasCheckConstraint("CK_MemorialSites_DescriptionVi_MinLength",
                "DescriptionVi IS NULL OR LEN(TRIM(DescriptionVi)) >= 30");
            t.HasCheckConstraint("CK_MemorialSites_DescriptionEn_MinLength",
                "DescriptionEn IS NULL OR LEN(TRIM(DescriptionEn)) >= 30");
            t.HasCheckConstraint("CK_MemorialSites_HistoryVi_MinLength",
                "HistoryVi IS NULL OR LEN(TRIM(HistoryVi)) >= 50");
            t.HasCheckConstraint("CK_MemorialSites_HistoryEn_MinLength",
                "HistoryEn IS NULL OR LEN(TRIM(HistoryEn)) >= 50");
            t.HasCheckConstraint("CK_MemorialSites_AddressVi_MinLength",
                "AddressVi IS NULL OR LEN(TRIM(AddressVi)) >= 5");
            t.HasCheckConstraint("CK_MemorialSites_AddressEn_MinLength",
                "AddressEn IS NULL OR LEN(TRIM(AddressEn)) >= 5");
        });
        builder.HasKey(x => x.MemorialSiteId);
        builder.Property(x => x.MemorialSiteId).ValueGeneratedOnAdd();
        builder.Property(x => x.PublicId).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.Code).HasColumnType("nvarchar(50)").IsRequired();
        builder.Property(x => x.NameVi).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.NameEn).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.Slug).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.Category).HasColumnType("nvarchar(30)").IsRequired();
        builder.Property(x => x.Classification).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.Status).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.OtherNames).HasColumnType("nvarchar(255)");
        builder.Property(x => x.AddressVi).HasColumnType("nvarchar(500)");
        builder.Property(x => x.AddressEn).HasColumnType("nvarchar(500)");
        builder.Property(x => x.Latitude).HasColumnType("decimal(10,8)");
        builder.Property(x => x.Longitude).HasColumnType("decimal(11,8)");
        builder.Property(x => x.GoogleMapUrl).HasColumnType("nvarchar(1000)");
        builder.Property(x => x.DescriptionVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.DescriptionEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.HistoryVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.HistoryEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.EventDate).HasColumnType("nvarchar(100)");
        builder.Property(x => x.CommemorationVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.CommemorationEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ImageUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.VideoUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.GalleryImages).HasColumnType("nvarchar(max)");
        builder.Property(x => x.IsDeleted).HasColumnType("bit").HasDefaultValue(false);
        builder.Property(x => x.DeletedAt).HasColumnType("datetime2");
        builder.Property(x => x.CreatedBy).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.CreatedBy);
        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.Classification);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.IsDeleted);
        builder.HasIndex(x => x.PublicId).IsUnique();
        builder.HasIndex(x => x.Code);
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.NameVi).IsUnique().HasFilter("IsDeleted = 0");
        builder.HasIndex(x => x.NameEn).IsUnique().HasFilter("IsDeleted = 0");
    }
}