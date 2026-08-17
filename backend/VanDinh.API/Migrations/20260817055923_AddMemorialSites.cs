using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMemorialSites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MemorialSites",
                columns: table => new
                {
                    MemorialSiteId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameVi = table.Column<string>(type: "nvarchar(255)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(255)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(30)", nullable: false),
                    Classification = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    OtherNames = table.Column<string>(type: "nvarchar(255)", maxLength: 200, nullable: true),
                    AddressVi = table.Column<string>(type: "nvarchar(500)", maxLength: 300, nullable: true),
                    AddressEn = table.Column<string>(type: "nvarchar(500)", maxLength: 300, nullable: true),
                    Latitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    GoogleMapUrl = table.Column<string>(type: "nvarchar(1000)", nullable: true),
                    DescriptionVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescriptionEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HistoryVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HistoryEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EventDate = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    CommemorationVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CommemorationEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    VideoUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    GalleryImages = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemorialSites", x => x.MemorialSiteId);
                    table.CheckConstraint("CK_MemorialSites_AddressEn_MinLength", "AddressEn IS NULL OR LEN(TRIM(AddressEn)) >= 5");
                    table.CheckConstraint("CK_MemorialSites_AddressVi_MinLength", "AddressVi IS NULL OR LEN(TRIM(AddressVi)) >= 5");
                    table.CheckConstraint("CK_MemorialSites_Category", "Category IN ('memorial', 'victory', 'military_camp', 'secret_base', 'battlefield', 'revolutionary_event', 'other')");
                    table.CheckConstraint("CK_MemorialSites_Classification", "Classification IN ('national', 'provincial', 'city', 'unranked')");
                    table.CheckConstraint("CK_MemorialSites_DescriptionEn_MinLength", "DescriptionEn IS NULL OR LEN(TRIM(DescriptionEn)) >= 30");
                    table.CheckConstraint("CK_MemorialSites_DescriptionVi_MinLength", "DescriptionVi IS NULL OR LEN(TRIM(DescriptionVi)) >= 30");
                    table.CheckConstraint("CK_MemorialSites_HistoryEn_MinLength", "HistoryEn IS NULL OR LEN(TRIM(HistoryEn)) >= 50");
                    table.CheckConstraint("CK_MemorialSites_HistoryVi_MinLength", "HistoryVi IS NULL OR LEN(TRIM(HistoryVi)) >= 50");
                    table.CheckConstraint("CK_MemorialSites_NameEn_NotEmpty", "LEN(TRIM(NameEn)) >= 5");
                    table.CheckConstraint("CK_MemorialSites_NameVi_NotEmpty", "LEN(TRIM(NameVi)) >= 5");
                    table.CheckConstraint("CK_MemorialSites_Status", "Status IN ('active', 'maintenance', 'closed')");
                    table.ForeignKey(
                        name: "FK_MemorialSites_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_Category",
                table: "MemorialSites",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_Classification",
                table: "MemorialSites",
                column: "Classification");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_Code",
                table: "MemorialSites",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_CreatedBy",
                table: "MemorialSites",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_IsDeleted",
                table: "MemorialSites",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_NameEn",
                table: "MemorialSites",
                column: "NameEn",
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_NameVi",
                table: "MemorialSites",
                column: "NameVi",
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_PublicId",
                table: "MemorialSites",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_Slug",
                table: "MemorialSites",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MemorialSites_Status",
                table: "MemorialSites",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemorialSites");
        }
    }
}
