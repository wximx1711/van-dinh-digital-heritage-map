using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIntangibleHeritageCategoryConstraint : Migration
    {
        private const string TableName = "IntangibleHeritage";
        private const string NewConstraintName = "CK_IntangibleHeritage_Category";
        private const string NewConstraintSql = "Category IN ('knowledge','festival','belief','craft')";
        private const string OldConstraintSql = "Category IN ('festival','performance','craft','ritual','story')";

        private static string DropExistingConstraint()
        {
            return $@"
DECLARE @sql NVARCHAR(MAX);
SELECT @sql = 'ALTER TABLE [{TableName}] DROP CONSTRAINT [' + dc.name + ']'
FROM sys.check_constraints dc
JOIN sys.tables t ON dc.parent_object_id = t.object_id
WHERE t.name = '{TableName}';
IF @sql IS NOT NULL EXEC sp_executesql @sql;";
        }

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Migrate obsolete category values to their correct replacements
            // performance → knowledge  (Tri thức dân gian)
            // ritual      → belief      (Tập quán tín ngưỡng)
            // story       → knowledge   (Tri thức dân gian)
            // festival and craft remain unchanged
            migrationBuilder.Sql($"UPDATE [{TableName}] SET Category = 'knowledge' WHERE Category = 'performance'");
            migrationBuilder.Sql($"UPDATE [{TableName}] SET Category = 'belief' WHERE Category = 'ritual'");
            migrationBuilder.Sql($"UPDATE [{TableName}] SET Category = 'knowledge' WHERE Category = 'story'");

            // Drop the old constraint (now safe — no rows violate the new values)
            migrationBuilder.Sql(DropExistingConstraint());

            // Create the new constraint enforcing only the 4 categories
            migrationBuilder.Sql(
                $"ALTER TABLE [{TableName}] ADD CONSTRAINT [{NewConstraintName}] CHECK ({NewConstraintSql})");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the new constraint first so we can safely restore old values
            migrationBuilder.Sql(DropExistingConstraint());

            // Reverse the data migration
            // knowledge → performance (best-effort reversal)
            // belief    → ritual
            // festival and craft remain unchanged
            migrationBuilder.Sql($"UPDATE [{TableName}] SET Category = 'performance' WHERE Category = 'knowledge'");
            migrationBuilder.Sql($"UPDATE [{TableName}] SET Category = 'ritual' WHERE Category = 'belief'");

            // Restore the original constraint
            migrationBuilder.Sql(
                $"ALTER TABLE [{TableName}] ADD CONSTRAINT [{NewConstraintName}] CHECK ({OldConstraintSql})");
        }
    }
}
