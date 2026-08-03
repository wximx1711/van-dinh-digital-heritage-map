using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMailMergeJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MailMergeJobs",
                columns: table => new
                {
                    JobId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ExcelFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FilenamePattern = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PlaceholdersJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MappingJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalRows = table.Column<int>(type: "int", nullable: false),
                    SuccessCount = table.Column<int>(type: "int", nullable: false),
                    FailedCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ErrorsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ZipFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    CreatedByUsername = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MailMergeJobs", x => x.JobId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MailMergeJobs_CreatedAt",
                table: "MailMergeJobs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_MailMergeJobs_CreatedBy",
                table: "MailMergeJobs",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MailMergeJobs_PublicId",
                table: "MailMergeJobs",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MailMergeJobs_Status",
                table: "MailMergeJobs",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MailMergeJobs");
        }
    }
}
