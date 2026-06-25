using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDinh.API.Models;

namespace VanDinh.API.Data.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");
        builder.HasKey(x => x.RoleId);
        builder.Property(x => x.RoleId).ValueGeneratedOnAdd();
        builder.Property(x => x.RoleName).HasColumnType("nvarchar(50)").IsRequired();
        builder.HasIndex(x => x.RoleName).IsUnique();
    }
}
