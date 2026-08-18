using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class IntangibleHeritageConfiguration : IEntityTypeConfiguration<IntangibleHeritage>
{
    public void Configure(EntityTypeBuilder<IntangibleHeritage> builder)
    {
        builder.ToTable("IntangibleHeritage", t =>
        {
            t.HasCheckConstraint("CK_IntangibleHeritage_Category",
                "Category IN ('knowledge', 'festival', 'belief', 'craft')");
        });
        builder.HasKey(x => x.IntangibleId);
        builder.Property(x => x.IntangibleId).ValueGeneratedOnAdd();
        builder.Property(x => x.PublicId).HasColumnType("nvarchar(20)").IsRequired();
        builder.Property(x => x.Code).HasColumnType("nvarchar(50)").IsRequired();
        builder.Property(x => x.NameVi).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.NameEn).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.Category).HasColumnType("nvarchar(30)").IsRequired();
        builder.Property(x => x.DescriptionVi).HasColumnType("nvarchar(max)");
        builder.Property(x => x.DescriptionEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ImageUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.VideoUrl).HasColumnType("nvarchar(500)");
        builder.Property(x => x.OtherNames).HasColumnType("nvarchar(500)");
        builder.Property(x => x.Location).HasColumnType("nvarchar(500)");
        builder.Property(x => x.CulturalSpace).HasColumnType("nvarchar(max)");
        builder.Property(x => x.Community).HasColumnType("nvarchar(500)");
        builder.Property(x => x.RepresentativePersons).HasColumnType("nvarchar(500)");
        builder.Property(x => x.Origin).HasColumnType("nvarchar(max)");
        builder.Property(x => x.OriginEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.FormationHistory).HasColumnType("nvarchar(max)");
        builder.Property(x => x.HistoricalDevelopment).HasColumnType("nvarchar(max)");
        builder.Property(x => x.WorshipObjects).HasColumnType("nvarchar(max)");
        builder.Property(x => x.FestivalTime).HasColumnType("nvarchar(200)");
        builder.Property(x => x.FestivalDuration).HasColumnType("nvarchar(200)");
        builder.Property(x => x.FestivalLocation).HasColumnType("nvarchar(500)");
        builder.Property(x => x.RitualParticipants).HasColumnType("nvarchar(max)");
        builder.Property(x => x.RitualProcess).HasColumnType("nvarchar(max)");
        builder.Property(x => x.CustomsAndOfferings).HasColumnType("nvarchar(max)");
        builder.Property(x => x.FolkGames).HasColumnType("nvarchar(max)");
        builder.Property(x => x.TraditionalPerformances).HasColumnType("nvarchar(max)");
        builder.Property(x => x.RitualObjects).HasColumnType("nvarchar(max)");
        builder.Property(x => x.RelatedDocuments).HasColumnType("nvarchar(max)");
        builder.Property(x => x.RelatedDocumentsEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ExistingArtisans).HasColumnType("nvarchar(max)");
        builder.Property(x => x.TeachingArtisans).HasColumnType("nvarchar(max)");
        builder.Property(x => x.Practitioners).HasColumnType("nvarchar(max)");
        builder.Property(x => x.Learners).HasColumnType("nvarchar(max)");
        builder.Property(x => x.OtherHumanResources).HasColumnType("nvarchar(max)");
        builder.Property(x => x.TransmissionMethod).HasColumnType("nvarchar(max)");
        builder.Property(x => x.CurrentStatus).HasColumnType("nvarchar(max)");
        builder.Property(x => x.CurrentStatusEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ThreatLevel).HasColumnType("nvarchar(100)");
        builder.Property(x => x.RiskDescription).HasColumnType("nvarchar(max)");
        builder.Property(x => x.HeritageValue).HasColumnType("nvarchar(max)");
        builder.Property(x => x.HeritageValueEn).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ExistingProtectionMeasures).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ProposedProtectionMeasures).HasColumnType("nvarchar(max)");
        builder.Property(x => x.GalleryImages).HasColumnType("nvarchar(max)");
        builder.Property(x => x.IsDeleted).HasColumnType("bit").HasDefaultValue(false);
        builder.Property(x => x.CreatedBy).IsRequired();
        builder.Property(x => x.UpdatedBy).HasColumnType("bigint");
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");

        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.Code);
        builder.HasIndex(x => x.PublicId).IsUnique();
        builder.HasIndex(x => x.NameVi).IsUnique().HasFilter("IsDeleted = 0");
        builder.HasIndex(x => x.NameEn).IsUnique().HasFilter("IsDeleted = 0");
    }
}
