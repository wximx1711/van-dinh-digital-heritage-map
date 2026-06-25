using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(x => x.UserId);
        builder.Property(x => x.UserId).ValueGeneratedOnAdd();
        builder.Property(x => x.Username).HasColumnType("nvarchar(50)").IsRequired();
        builder.Property(x => x.PasswordHash).HasColumnType("nvarchar(255)").IsRequired();
        builder.Property(x => x.FullName).HasColumnType("nvarchar(100)");
        builder.Property(x => x.Email).HasColumnType("nvarchar(100)");
        builder.Property(x => x.Status).HasColumnType("bit").HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(x => x.UpdatedAt).HasColumnType("datetime2");
        builder.HasOne(x => x.Role)
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => x.Username).IsUnique();
        builder.HasIndex(x => x.RoleId);
    }
}
