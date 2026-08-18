using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHomePageBackgroundSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HomeBackgroundImageUrl",
                table: "SystemSettings",
                type: "nvarchar(500)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HomeBackgroundType",
                table: "SystemSettings",
                type: "nvarchar(20)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HomeBackgroundVideoPosterUrl",
                table: "SystemSettings",
                type: "nvarchar(500)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HomeBackgroundVideoUrl",
                table: "SystemSettings",
                type: "nvarchar(500)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HomeBackgroundImageUrl",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "HomeBackgroundType",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "HomeBackgroundVideoPosterUrl",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "HomeBackgroundVideoUrl",
                table: "SystemSettings");
        }
    }
}
