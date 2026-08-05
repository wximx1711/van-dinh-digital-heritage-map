using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEvaluationManagementFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminReply",
                table: "ServiceEvaluations",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "ServiceEvaluations",
                type: "nvarchar(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "ServiceEvaluations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ReviewerName",
                table: "ServiceEvaluations",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SatisfactionLevel",
                table: "ServiceEvaluations",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "ServiceEvaluations",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "pending");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "ServiceEvaluations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceEvaluations_Status",
                table: "ServiceEvaluations",
                column: "Status");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ServiceEvaluation_SatisfactionLevel",
                table: "ServiceEvaluations",
                sql: "SatisfactionLevel IS NULL OR SatisfactionLevel IN ('very_satisfied', 'satisfied', 'neutral', 'unsatisfied', 'very_unsatisfied')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ServiceEvaluation_Status",
                table: "ServiceEvaluations",
                sql: "Status IN ('pending', 'approved', 'rejected')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceEvaluations_Status",
                table: "ServiceEvaluations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ServiceEvaluation_SatisfactionLevel",
                table: "ServiceEvaluations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ServiceEvaluation_Status",
                table: "ServiceEvaluations");

            migrationBuilder.DropColumn(
                name: "AdminReply",
                table: "ServiceEvaluations");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "ServiceEvaluations");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "ServiceEvaluations");

            migrationBuilder.DropColumn(
                name: "ReviewerName",
                table: "ServiceEvaluations");

            migrationBuilder.DropColumn(
                name: "SatisfactionLevel",
                table: "ServiceEvaluations");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ServiceEvaluations");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "ServiceEvaluations");
        }
    }
}
