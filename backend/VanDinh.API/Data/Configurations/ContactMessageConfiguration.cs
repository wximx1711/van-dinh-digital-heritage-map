using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.ToTable("ContactMessages");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.Property(x => x.FullName).HasColumnType("nvarchar(100)").IsRequired();
        builder.Property(x => x.Email).HasColumnType("nvarchar(200)").IsRequired();
        builder.Property(x => x.Subject).HasColumnType("nvarchar(500)");
        builder.Property(x => x.Message).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(x => x.ReadAt).HasColumnType("datetime2");
        builder.Property(x => x.IPAddress).HasColumnType("nvarchar(50)");
        builder.Property(x => x.UserAgent).HasColumnType("nvarchar(max)");
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.IsRead);
    }
}
