using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    public partial class AddIntangibleHeritageEnglishFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OriginEn",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeritageValueEn",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentStatusEn",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelatedDocumentsEn",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "OriginEn", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "HeritageValueEn", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "CurrentStatusEn", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "RelatedDocumentsEn", table: "IntangibleHeritage");
        }
    }
}
