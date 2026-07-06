using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAboutPageModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF OBJECT_ID('CK_AboutPage_Content_MinLength', 'C') IS NOT NULL
                    ALTER TABLE [AboutPage] DROP CONSTRAINT [CK_AboutPage_Content_MinLength]");

            migrationBuilder.DropColumn(
                name: "Content",
                table: "AboutPage");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "AboutPage");

            migrationBuilder.AddColumn<string>(
                name: "ContactInfo",
                table: "AboutPage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IntroductionEn",
                table: "AboutPage",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IntroductionVi",
                table: "AboutPage",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MainContentEn",
                table: "AboutPage",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MainContentVi",
                table: "AboutPage",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TitleEn",
                table: "AboutPage",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TitleVi",
                table: "AboutPage",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactInfo",
                table: "AboutPage");

            migrationBuilder.DropColumn(
                name: "IntroductionEn",
                table: "AboutPage");

            migrationBuilder.DropColumn(
                name: "IntroductionVi",
                table: "AboutPage");

            migrationBuilder.DropColumn(
                name: "MainContentEn",
                table: "AboutPage");

            migrationBuilder.DropColumn(
                name: "MainContentVi",
                table: "AboutPage");

            migrationBuilder.DropColumn(
                name: "TitleEn",
                table: "AboutPage");

            migrationBuilder.DropColumn(
                name: "TitleVi",
                table: "AboutPage");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "AboutPage",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "AboutPage",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AboutPage_Content_MinLength",
                table: "AboutPage",
                sql: "Content IS NULL OR LEN(TRIM(Content)) >= 100");
        }
    }
}
