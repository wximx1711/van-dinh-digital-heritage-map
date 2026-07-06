using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class RelatedLinkConfiguration : IEntityTypeConfiguration<RelatedLink>
{
    public void Configure(EntityTypeBuilder<RelatedLink> builder)
    {
        builder.ToTable("RelatedLinks");
        builder.HasKey(x => x.LinkId);
        builder.Property(x => x.LinkId).ValueGeneratedOnAdd();
        builder.Property(x => x.Title).HasColumnType("nvarchar(200)").IsRequired();
        builder.Property(x => x.Url).HasColumnType("nvarchar(500)").IsRequired();
        builder.Property(x => x.DisplayOrder).HasDefaultValue(0);
        builder.Property(x => x.IsEnabled).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UpdatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.CreatedBy);
        builder.HasIndex(x => x.UpdatedBy);
    }
}
