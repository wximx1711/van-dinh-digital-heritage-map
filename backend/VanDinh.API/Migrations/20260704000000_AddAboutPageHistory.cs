using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAboutPageHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AboutPageHistories",
                columns: table => new
                {
                    HistoryId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AboutId = table.Column<int>(type: "int", nullable: false),
                    TitleVi = table.Column<string>(type: "nvarchar(200)", nullable: true),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", nullable: true),
                    IntroductionVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IntroductionEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MainContentVi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MainContentEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BannerImage = table.Column<string>(type: "nvarchar(500)", nullable: true),
                    ContactInfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutPageHistories", x => x.HistoryId);
                    table.ForeignKey(
                        name: "FK_AboutPageHistories_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AboutPageHistories_AboutId",
                table: "AboutPageHistories",
                column: "AboutId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutPageHistories_UpdatedBy",
                table: "AboutPageHistories",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AboutPageHistories");
        }
    }
}
