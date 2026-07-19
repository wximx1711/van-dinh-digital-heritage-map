using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMonthlyUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MonthlyUpdates");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MonthlyUpdates",
                columns: table => new
                {
                    UpdateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DisplayEn = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DisplayVi = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MonthLabel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UpdateCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyUpdates", x => x.UpdateId);
                });
        }
    }
}
