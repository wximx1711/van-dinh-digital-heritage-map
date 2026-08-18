using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessCodesToIntangibleAndMemorial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "IntangibleHeritage",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            // Backfill business codes for ACTIVE intangible heritage records
            // only (soft-deleted records such as ih0007 are skipped and do not
            // consume a sequence number). Codes are assigned in creation order
            // (IntangibleId) starting from VĐHN-PVT-001.
            migrationBuilder.Sql("""
                UPDATE ih
                SET ih.Code = 'VĐHN-PVT-' + RIGHT('000' + CAST(numbered.rn AS varchar(10)), 3)
                FROM (
                    SELECT IntangibleId, ROW_NUMBER() OVER (ORDER BY IntangibleId) AS rn
                    FROM IntangibleHeritage
                    WHERE IsDeleted = 0
                ) numbered
                INNER JOIN IntangibleHeritage ih ON ih.IntangibleId = numbered.IntangibleId
                """);

            // Standardize ACTIVE memorial site codes to the VĐHN-ĐLN-XXX format.
            // Only the active records (ms0007, ms0008) are updated; soft-deleted
            // records keep their historical VĐLN-SKCMKC-XXX codes untouched.
            migrationBuilder.Sql("UPDATE MemorialSites SET Code = N'VĐHN-ĐLN-001' WHERE PublicId = N'ms0007' AND IsDeleted = 0");
            migrationBuilder.Sql("UPDATE MemorialSites SET Code = N'VĐHN-ĐLN-002' WHERE PublicId = N'ms0008' AND IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_IntangibleHeritage_Code",
                table: "IntangibleHeritage",
                column: "Code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_IntangibleHeritage_Code",
                table: "IntangibleHeritage");

            // Restore the standardized active memorial codes to their prior
            // empty state (defensive: only rows carrying the new codes).
            migrationBuilder.Sql("UPDATE MemorialSites SET Code = N'' WHERE PublicId = N'ms0007' AND IsDeleted = 0 AND Code = N'VĐHN-ĐLN-001'");
            migrationBuilder.Sql("UPDATE MemorialSites SET Code = N'' WHERE PublicId = N'ms0008' AND IsDeleted = 0 AND Code = N'VĐHN-ĐLN-002'");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "IntangibleHeritage");
        }
    }
}
