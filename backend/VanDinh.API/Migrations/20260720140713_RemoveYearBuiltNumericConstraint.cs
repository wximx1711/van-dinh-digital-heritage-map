using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveYearBuiltNumericConstraint : Migration
    {
        private const string TableName = "Heritage";
        private const string NewConstraintName = "CK_Heritage_YearBuilt";
        private const string NewConstraintSql = "YearBuilt IS NULL OR (TRY_CAST(YearBuilt AS INT) IS NOT NULL AND TRY_CAST(YearBuilt AS INT) >= 100 AND TRY_CAST(YearBuilt AS INT) <= YEAR(GETDATE()))";

        /// <summary>
        /// Dynamically drops any CHECK constraint on the Heritage table whose definition
        /// references the YearBuilt column. Uses OBJECT_DEFINITION to match only the
        /// YearBuilt constraint without assuming a fixed constraint name.
        /// </summary>
        private static string DropYearBuiltConstraint()
        {
            return $@"
DECLARE @sql NVARCHAR(MAX);
SELECT @sql = 'ALTER TABLE [{TableName}] DROP CONSTRAINT [' + dc.name + ']'
FROM sys.check_constraints dc
JOIN sys.tables t ON dc.parent_object_id = t.object_id
WHERE t.name = '{TableName}'
  AND OBJECT_DEFINITION(dc.object_id) LIKE '%YearBuilt%';
IF @sql IS NOT NULL EXEC sp_executesql @sql;";
        }

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(DropYearBuiltConstraint());
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop any existing constraint with this name first (idempotent re-apply)
            migrationBuilder.Sql(DropYearBuiltConstraint());

            migrationBuilder.Sql(
                $"ALTER TABLE [{TableName}] ADD CONSTRAINT [{NewConstraintName}] CHECK ({NewConstraintSql})");
        }
    }
}
