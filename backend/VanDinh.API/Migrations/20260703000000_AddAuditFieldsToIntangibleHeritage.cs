using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditFieldsToIntangibleHeritage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "CreatedBy",
                table: "IntangibleHeritage",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedBy",
                table: "IntangibleHeritage",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_IntangibleHeritage_CreatedBy",
                table: "IntangibleHeritage",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_IntangibleHeritage_UpdatedBy",
                table: "IntangibleHeritage",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_IntangibleHeritage_CreatedBy",
                table: "IntangibleHeritage");

            migrationBuilder.DropIndex(
                name: "IX_IntangibleHeritage_UpdatedBy",
                table: "IntangibleHeritage");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "IntangibleHeritage");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "IntangibleHeritage");
        }
    }
}
