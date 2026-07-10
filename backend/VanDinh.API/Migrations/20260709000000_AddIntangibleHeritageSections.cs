using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDinh.API.Migrations
{
    public partial class AddIntangibleHeritageSections : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Community",
                table: "IntangibleHeritage",
                type: "nvarchar(500)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CulturalSpace",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentStatus",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomsAndOfferings",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExistingArtisans",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExistingProtectionMeasures",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FestivalDuration",
                table: "IntangibleHeritage",
                type: "nvarchar(200)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FestivalLocation",
                table: "IntangibleHeritage",
                type: "nvarchar(500)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FestivalTime",
                table: "IntangibleHeritage",
                type: "nvarchar(200)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FolkGames",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FormationHistory",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GalleryImages",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeritageValue",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HistoricalDevelopment",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Learners",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "IntangibleHeritage",
                type: "nvarchar(500)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Origin",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherHumanResources",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherNames",
                table: "IntangibleHeritage",
                type: "nvarchar(500)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Practitioners",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProposedProtectionMeasures",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelatedDocuments",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RepresentativePersons",
                table: "IntangibleHeritage",
                type: "nvarchar(500)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RiskDescription",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RitualObjects",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RitualParticipants",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RitualProcess",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TeachingArtisans",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThreatLevel",
                table: "IntangibleHeritage",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TraditionalPerformances",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransmissionMethod",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorshipObjects",
                table: "IntangibleHeritage",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Community", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "CulturalSpace", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "CurrentStatus", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "CustomsAndOfferings", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "ExistingArtisans", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "ExistingProtectionMeasures", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "FestivalDuration", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "FestivalLocation", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "FestivalTime", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "FolkGames", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "FormationHistory", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "GalleryImages", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "HeritageValue", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "HistoricalDevelopment", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "Learners", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "Location", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "Origin", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "OtherHumanResources", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "OtherNames", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "Practitioners", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "ProposedProtectionMeasures", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "RelatedDocuments", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "RepresentativePersons", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "RiskDescription", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "RitualObjects", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "RitualParticipants", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "RitualProcess", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "TeachingArtisans", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "ThreatLevel", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "TraditionalPerformances", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "TransmissionMethod", table: "IntangibleHeritage");
            migrationBuilder.DropColumn(name: "WorshipObjects", table: "IntangibleHeritage");
        }
    }
}
