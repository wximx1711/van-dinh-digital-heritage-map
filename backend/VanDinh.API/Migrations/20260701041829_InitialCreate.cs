using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HeritageCategories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NameVi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(255)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HeritageCategories", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "IntangibleHeritage",
                columns: table => new
                {
                    IntangibleId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    NameVi = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(30)", nullable: false),
                    DescriptionVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescriptionEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    VideoUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntangibleHeritage", x => x.IntangibleId);
                    table.CheckConstraint("CK_IntangibleHeritage_Category", "Category IN ('festival', 'performance', 'craft', 'ritual', 'story')");
                });

            migrationBuilder.CreateTable(
                name: "MonthlyUpdates",
                columns: table => new
                {
                    UpdateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MonthLabel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DisplayVi = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DisplayEn = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UpdateCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyUpdates", x => x.UpdateId);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    Status = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AboutPage",
                columns: table => new
                {
                    AboutId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BannerImage = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutPage", x => x.AboutId);
                    table.ForeignKey(
                        name: "FK_AboutPage_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ActivityLogs",
                columns: table => new
                {
                    LogId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<long>(type: "bigint", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityLogs", x => x.LogId);
                    table.ForeignKey(
                        name: "FK_ActivityLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Heritage",
                columns: table => new
                {
                    HeritageId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    NameVi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Classification = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    AddressVi = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    AddressEn = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    Latitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    DescriptionVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescriptionEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HistoryVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HistoryEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    YearBuilt = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    Guardian = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    QrCodeUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    GoogleMapUrl = table.Column<string>(type: "nvarchar(1000)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Heritage", x => x.HeritageId);
                    table.CheckConstraint("CK_Heritage_Classification", "Classification IN ('national', 'city', 'unranked')");
                    table.CheckConstraint("CK_Heritage_Status", "Status IN ('active', 'maintenance', 'closed')");
                    table.ForeignKey(
                        name: "FK_Heritage_HeritageCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "HeritageCategories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Heritage_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    SettingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WebsiteName = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    FooterText = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    FacebookUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    TiktokUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.SettingId);
                    table.ForeignKey(
                        name: "FK_SystemSettings_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HeritageDocuments",
                columns: table => new
                {
                    DocumentId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HeritageId = table.Column<long>(type: "bigint", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    FileType = table.Column<string>(type: "nvarchar(20)", nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HeritageDocuments", x => x.DocumentId);
                    table.ForeignKey(
                        name: "FK_HeritageDocuments_Heritage_HeritageId",
                        column: x => x.HeritageId,
                        principalTable: "Heritage",
                        principalColumn: "HeritageId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HeritageImages",
                columns: table => new
                {
                    ImageId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HeritageId = table.Column<long>(type: "bigint", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Caption = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HeritageImages", x => x.ImageId);
                    table.ForeignKey(
                        name: "FK_HeritageImages_Heritage_HeritageId",
                        column: x => x.HeritageId,
                        principalTable: "Heritage",
                        principalColumn: "HeritageId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HeritageVideos",
                columns: table => new
                {
                    VideoId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HeritageId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    VideoType = table.Column<string>(type: "nvarchar(20)", nullable: true),
                    VideoUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HeritageVideos", x => x.VideoId);
                    table.ForeignKey(
                        name: "FK_HeritageVideos_Heritage_HeritageId",
                        column: x => x.HeritageId,
                        principalTable: "Heritage",
                        principalColumn: "HeritageId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AboutPage_UpdatedBy",
                table: "AboutPage",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_CreatedAt",
                table: "ActivityLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_EntityName",
                table: "ActivityLogs",
                column: "EntityName");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_UserId",
                table: "ActivityLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_CategoryId",
                table: "Heritage",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_Classification",
                table: "Heritage",
                column: "Classification");

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_Code",
                table: "Heritage",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_CreatedBy",
                table: "Heritage",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_IsDeleted",
                table: "Heritage",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_PublicId",
                table: "Heritage",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_Slug",
                table: "Heritage",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Heritage_Status",
                table: "Heritage",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_HeritageCategories_Code",
                table: "HeritageCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HeritageDocuments_HeritageId",
                table: "HeritageDocuments",
                column: "HeritageId");

            migrationBuilder.CreateIndex(
                name: "IX_HeritageImages_HeritageId",
                table: "HeritageImages",
                column: "HeritageId");

            migrationBuilder.CreateIndex(
                name: "IX_HeritageVideos_HeritageId",
                table: "HeritageVideos",
                column: "HeritageId");

            migrationBuilder.CreateIndex(
                name: "IX_IntangibleHeritage_Category",
                table: "IntangibleHeritage",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_IntangibleHeritage_PublicId",
                table: "IntangibleHeritage",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_RoleName",
                table: "Roles",
                column: "RoleName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_UpdatedBy",
                table: "SystemSettings",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AboutPage");

            migrationBuilder.DropTable(
                name: "ActivityLogs");

            migrationBuilder.DropTable(
                name: "HeritageDocuments");

            migrationBuilder.DropTable(
                name: "HeritageImages");

            migrationBuilder.DropTable(
                name: "HeritageVideos");

            migrationBuilder.DropTable(
                name: "IntangibleHeritage");

            migrationBuilder.DropTable(
                name: "MonthlyUpdates");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropTable(
                name: "Heritage");

            migrationBuilder.DropTable(
                name: "HeritageCategories");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
