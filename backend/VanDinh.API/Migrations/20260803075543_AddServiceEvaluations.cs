using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceEvaluations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ServiceEvaluations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TargetType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TargetId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Score = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DeviceName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceEvaluations", x => x.Id);
                    table.CheckConstraint("CK_ServiceEvaluation_Score", "Score BETWEEN 1 AND 5");
                    table.CheckConstraint("CK_ServiceEvaluation_TargetType", "TargetType IN ('service', 'heritage', 'intangible')");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceEvaluations_CreatedAt",
                table: "ServiceEvaluations",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceEvaluations_TargetType",
                table: "ServiceEvaluations",
                column: "TargetType");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceEvaluations_TargetType_TargetId",
                table: "ServiceEvaluations",
                columns: new[] { "TargetType", "TargetId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceEvaluations");
        }
    }
}
