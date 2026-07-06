using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class AboutPageConfiguration : IEntityTypeConfiguration<AboutPage>
{
    public void Configure(EntityTypeBuilder<AboutPage> builder)
    {
        builder.ToTable("AboutPage");
        builder.HasKey(x => x.AboutId);
        builder.Property(x => x.AboutId).ValueGeneratedOnAdd();
        builder.Property(x => x.TitleVi).HasColumnType("nvarchar(200)").IsRequired();
        builder.Property(x => x.TitleEn).HasColumnType("nvarchar(200)").IsRequired();
        builder.Property(x => x.IntroductionVi).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.IntroductionEn).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.MainContentVi).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.MainContentEn).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.BannerImage).HasColumnType("nvarchar(500)");
        builder.Property(x => x.ContactInfo).HasColumnType("nvarchar(max)");
        builder.Property(x => x.UpdatedBy).IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UpdatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.UpdatedBy);
    }
}
