using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    public partial class RemoveHeritageCodeUniqueConstraint : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Heritage_Code",
                table: "Heritage");

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_Code",
                table: "Heritage",
                column: "Code");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Heritage_Code",
                table: "Heritage");

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_Code",
                table: "Heritage",
                column: "Code",
                unique: true);
        }
    }
}
