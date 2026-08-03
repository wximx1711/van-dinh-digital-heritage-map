using System.Text;
using ClosedXML.Excel;
using ImageMagick;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VanDinh.API.DTOs;

namespace VanDinh.API.Services;

public interface IEvaluationReportExporter
{
    byte[] ExportExcel(EvaluationStatsDto stats, DateTime? startDate, DateTime? endDate);
    byte[] ExportPdf(EvaluationStatsDto stats, DateTime? startDate, DateTime? endDate);
}

/// <summary>
/// Renders evaluation statistics as Excel (ClosedXML) and PDF (QuestPDF) reports.
/// Charts are generated as SVG and rasterized to PNG with ImageMagick before
/// being embedded into the PDF, so no charting package is required.
/// </summary>
public sealed class EvaluationReportExporter : IEvaluationReportExporter
{
    private const string Primary = "#0F3D5E";
    private static readonly string[] ChartColors = ["#0F3D5E", "#D4A017", "#27AE60", "#E67E22", "#8E44AD"];

    public byte[] ExportExcel(EvaluationStatsDto stats, DateTime? startDate, DateTime? endDate)
    {
        using var wb = new XLWorkbook();

        var summary = wb.Worksheets.Add("Summary");
        summary.Cell(1, 1).Value = "Public Service Satisfaction Evaluation — Summary";
        summary.Range(1, 1, 1, 4).Merge();
        summary.Cell(1, 1).Style.Font.Bold = true;
        summary.Cell(1, 1).Style.Font.FontSize = 14;
        summary.Cell(1, 1).Style.Font.FontColor = XLColor.FromHtml("#FFFFFF");
        summary.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromHtml(Primary);

        summary.Cell(3, 1).Value = "Period";
        summary.Cell(3, 2).Value = FormatPeriod(startDate, endDate);
        summary.Cell(4, 1).Value = "Total Evaluations";
        summary.Cell(4, 2).Value = stats.Summary.TotalEvaluations;
        summary.Cell(5, 1).Value = "Average Score (1-5)";
        summary.Cell(5, 2).Value = stats.Summary.AverageScore;
        summary.Cell(6, 1).Value = "Satisfaction Rate (%)";
        summary.Cell(6, 2).Value = stats.Summary.SatisfactionRate;
        summary.Cell(7, 1).Value = "Today's Evaluations";
        summary.Cell(7, 2).Value = stats.Summary.TodayCount;
        summary.Cell(8, 1).Value = "This Month's Evaluations";
        summary.Cell(8, 2).Value = stats.Summary.MonthCount;

        summary.Column(1).Width = 26;
        summary.Column(2).Width = 30;
        summary.Column(3).Width = 30;
        summary.Column(4).Width = 16;

        var distribution = wb.Worksheets.Add("Rating Distribution");
        WriteSheetTitle(distribution, "Rating Distribution");
        WriteHeader(distribution, 3, ["Score", "Count", "Percentage (%)"]);
        for (var i = 0; i < stats.RatingDistribution.Count; i++)
        {
            var item = stats.RatingDistribution[i];
            distribution.Cell(4 + i, 1).Value = item.Score;
            distribution.Cell(4 + i, 2).Value = item.Count;
            distribution.Cell(4 + i, 3).Value = item.Percentage;
        }
        distribution.Columns(1, 3).AdjustToContents();

        var trend = wb.Worksheets.Add("Monthly Trend");
        WriteSheetTitle(trend, "Monthly Trend");
        WriteHeader(trend, 3, ["Month", "Evaluations", "Average Score"]);
        for (var i = 0; i < stats.MonthlyTrend.Count; i++)
        {
            var item = stats.MonthlyTrend[i];
            trend.Cell(4 + i, 1).Value = item.Month;
            trend.Cell(4 + i, 2).Value = item.Count;
            trend.Cell(4 + i, 3).Value = item.AverageScore;
        }
        trend.Columns(1, 3).AdjustToContents();

        WriteRankingSheet(wb, "Top 10 Heritage", stats.TopHeritages);
        WriteRankingSheet(wb, "Lowest Heritage", stats.LowestHeritages);
        WriteRankingSheet(wb, "Top 10 Intangible", stats.TopIntangible);
        WriteRankingSheet(wb, "Lowest Intangible", stats.LowestIntangible);

        using var stream = new MemoryStream();
        wb.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportPdf(EvaluationStatsDto stats, DateTime? startDate, DateTime? endDate)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        var summary = stats.Summary;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(ts => ts.FontSize(10).FontColor("#1a2332"));

                page.Header().Column(header =>
                {
                    header.Item().Text("Public Service Satisfaction Evaluation")
                        .FontSize(16).Bold().FontColor(Primary);
                    header.Item().Text($"Period: {FormatPeriod(startDate, endDate)}")
                        .FontSize(9).FontColor("#5d7a8c");
                    header.Item().PaddingVertical(8).LineHorizontal(1).LineColor("#D4A017");
                });

                page.Content().Column(content =>
                {
                    // Summary cards
                    content.Item().Row(row =>
                    {
                        SummaryCell(row.RelativeItem(), "Total", summary.TotalEvaluations.ToString(), ChartColors[0]);
                        SummaryCell(row.RelativeItem(), "Avg Score", summary.AverageScore.ToString("0.00"), ChartColors[1]);
                        SummaryCell(row.RelativeItem(), "Satisfaction", $"{summary.SatisfactionRate:0.0}%", ChartColors[2]);
                        SummaryCell(row.RelativeItem(), "Today", summary.TodayCount.ToString(), ChartColors[3]);
                        SummaryCell(row.RelativeItem(), "This Month", summary.MonthCount.ToString(), ChartColors[4]);
                    });

                    // Rating distribution chart
                    content.Item().PaddingTop(14).Text("Rating Distribution").FontSize(12).Bold().FontColor(Primary);
                    content.Item().PaddingTop(6).Height(150).Image(ChartImage(
                        BuildHorizontalBarChartSvg(stats.RatingDistribution
                            .Select(x => (x.Score.ToString(), x.Count, x.Percentage)).ToList())));

                    // Monthly trend chart
                    content.Item().PaddingTop(14).Text("Monthly Trend").FontSize(12).Bold().FontColor(Primary);
                    content.Item().PaddingTop(6).Height(190).Image(ChartImage(
                        BuildVerticalBarChartSvg(stats.MonthlyTrend
                            .Select(x => (x.Month, x.Count, x.AverageScore)).ToList())));

                    // Rankings
                    content.Item().PaddingTop(14).Text("Top 10 Heritage").FontSize(12).Bold().FontColor(Primary);
                    content.Item().PaddingTop(6).Table(t => RankingTable(t, stats.TopHeritages));
                    content.Item().PaddingTop(12).Text("Lowest Rated Heritage").FontSize(12).Bold().FontColor(Primary);
                    content.Item().PaddingTop(6).Table(t => RankingTable(t, stats.LowestHeritages));
                    content.Item().PaddingTop(12).Text("Top 10 Intangible Heritage").FontSize(12).Bold().FontColor(Primary);
                    content.Item().PaddingTop(6).Table(t => RankingTable(t, stats.TopIntangible));
                    content.Item().PaddingTop(12).Text("Lowest Rated Intangible Heritage").FontSize(12).Bold().FontColor(Primary);
                    content.Item().PaddingTop(6).Table(t => RankingTable(t, stats.LowestIntangible));
                });

                page.Footer().AlignCenter().Text(txt =>
                {
                    txt.DefaultTextStyle(ts => ts.FontSize(8).FontColor("#5d7a8c"));
                    txt.Span("Van Dinh Digital Heritage Map — generated ");
                    txt.CurrentPageNumber();
                });
            });
        });

        return document.GeneratePdf();
    }

    // ── Excel helpers ─────────────────────────────────────────────────

    private static void WriteSheetTitle(IXLWorksheet sheet, string title)
    {
        sheet.Cell(1, 1).Value = title;
        sheet.Range(1, 1, 1, 4).Merge();
        sheet.Cell(1, 1).Style.Font.Bold = true;
        sheet.Cell(1, 1).Style.Font.FontSize = 13;
        sheet.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromHtml(Primary);
        sheet.Cell(1, 1).Style.Font.FontColor = XLColor.FromHtml("#FFFFFF");
    }

    private static void WriteHeader(IXLWorksheet sheet, int row, string[] headers)
    {
        for (var i = 0; i < headers.Length; i++)
        {
            var cell = sheet.Cell(row, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontColor = XLColor.FromHtml("#FFFFFF");
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml(Primary);
        }
    }

    private static void WriteRankingSheet(XLWorkbook wb, string title, IReadOnlyList<EvaluationTopItem> items)
    {
        var sheet = wb.Worksheets.Add(title);
        WriteSheetTitle(sheet, title);
        WriteHeader(sheet, 3, ["Id", "Name (VI)", "Name (EN)", "Average Score", "Evaluations"]);
        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            sheet.Cell(4 + i, 1).Value = item.Id;
            sheet.Cell(4 + i, 2).Value = item.NameVi;
            sheet.Cell(4 + i, 3).Value = item.NameEn;
            sheet.Cell(4 + i, 4).Value = item.AverageScore;
            sheet.Cell(4 + i, 5).Value = item.EvaluationCount;
        }
        sheet.Columns(1, 5).AdjustToContents();
    }

    // ── PDF helpers ───────────────────────────────────────────────────

    private static void SummaryCell(IContainer container, string label, string value, string color)
    {
        container
            .Border(1).BorderColor("#E5EAF0").Background("#F8FAFC")
            .Padding(8).Column(cell =>
            {
                cell.Item().Text(value).FontSize(14).Bold().FontColor(color);
                cell.Item().Text(label).FontSize(8).FontColor("#5d7a8c");
            });
    }

    private static void RankingTable(TableDescriptor table, IReadOnlyList<EvaluationTopItem> items)
    {
        table.ColumnsDefinition(columns =>
        {
            columns.ConstantColumn(28);
            columns.RelativeColumn(2);
            columns.RelativeColumn(2);
            columns.ConstantColumn(56);
            columns.ConstantColumn(56);
        });

        table.Header(header =>
        {
            header.Cell().Background(Primary).Text("#").FontColor("#FFFFFF").FontSize(8).Bold();
            header.Cell().Background(Primary).Text("Name (VI)").FontColor("#FFFFFF").FontSize(8).Bold();
            header.Cell().Background(Primary).Text("Name (EN)").FontColor("#FFFFFF").FontSize(8).Bold();
            header.Cell().Background(Primary).AlignRight().Text("Avg").FontColor("#FFFFFF").FontSize(8).Bold();
            header.Cell().Background(Primary).AlignRight().Text("Count").FontColor("#FFFFFF").FontSize(8).Bold();
        });

        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            var bg = i % 2 == 0 ? "#FFFFFF" : "#F8FAFC";
            table.Cell().Background(bg).Text((i + 1).ToString()).FontSize(8).FontColor("#5d7a8c");
            table.Cell().Background(bg).Text(item.NameVi).FontSize(8);
            table.Cell().Background(bg).Text(item.NameEn).FontSize(8);
            table.Cell().Background(bg).AlignRight().Text(item.AverageScore.ToString("0.00")).FontSize(8).Bold().FontColor(ChartColors[i % ChartColors.Length]);
            table.Cell().Background(bg).AlignRight().Text(item.EvaluationCount.ToString()).FontSize(8);
        }
    }

    // ── Chart helpers (SVG → PNG via ImageMagick) ─────────────────────

    private static byte[] ChartImage(byte[] svg)
    {
        using var image = new MagickImage(svg, MagickFormat.Svg);
        image.Format = MagickFormat.Png;
        return image.ToByteArray();
    }

    private static byte[] BuildHorizontalBarChartSvg(IReadOnlyList<(string Label, int Value, double Pct)> rows)
    {
        const int width = 660;
        const int rowHeight = 34;
        var height = 16 + rows.Count * rowHeight;
        const int labelWidth = 64;
        var maxValue = Math.Max(1, rows.Max(r => r.Value));
        var chartWidth = width - labelWidth - 110;

        var sb = new StringBuilder();
        sb.AppendLine($"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{width}\" height=\"{height}\">");
        sb.AppendLine($"<rect x=\"0\" y=\"0\" width=\"{width}\" height=\"{height}\" fill=\"white\"/>");
        for (var i = 0; i < rows.Count; i++)
        {
            var (label, value, pct) = rows[i];
            var y = 8 + i * rowHeight;
            var barWidth = (int)(chartWidth * (value / (double)maxValue));
            sb.AppendLine($"<text x=\"{labelWidth - 8}\" y=\"{y + 16}\" font-size=\"13\" font-weight=\"bold\" fill=\"{Primary}\" text-anchor=\"end\">{EscapeXml(label)}</text>");
            sb.AppendLine($"<rect x=\"{labelWidth}\" y=\"{y}\" width=\"{Math.Max(1, barWidth)}\" height=\"22\" rx=\"2\" fill=\"{ChartColors[i % ChartColors.Length]}\"/>");
            sb.AppendLine($"<text x=\"{labelWidth + barWidth + 8}\" y=\"{y + 16}\" font-size=\"12\" fill=\"#5d7a8c\">{value} ({pct:0.0}%)</text>");
        }
        sb.AppendLine("</svg>");
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static byte[] BuildVerticalBarChartSvg(IReadOnlyList<(string Label, int Value, double Avg)> rows)
    {
        const int width = 660;
        const int height = 220;
        const int labelWidth = 52;
        const int bottomPad = 24;
        var chartHeight = height - bottomPad;
        var chartWidth = width - labelWidth;
        var maxValue = Math.Max(1, rows.Max(r => r.Value));
        var gap = 6;
        var barWidth = Math.Max(8, (chartWidth - gap * Math.Max(0, rows.Count - 1)) / Math.Max(1, rows.Count));

        var sb = new StringBuilder();
        sb.AppendLine($"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{width}\" height=\"{height}\">");
        sb.AppendLine($"<rect x=\"0\" y=\"0\" width=\"{width}\" height=\"{height}\" fill=\"white\"/>");
        sb.AppendLine($"<line x1=\"{labelWidth}\" y1=\"{chartHeight}\" x2=\"{width}\" y2=\"{chartHeight}\" stroke=\"#C9D4DE\" stroke-width=\"1\"/>");
        for (var i = 0; i < rows.Count; i++)
        {
            var (label, value, _) = rows[i];
            var x = labelWidth + i * (barWidth + gap);
            var barHeight = (int)(chartHeight * (value / (double)maxValue));
            var y = chartHeight - barHeight;
            sb.AppendLine($"<rect x=\"{x}\" y=\"{y}\" width=\"{barWidth}\" height=\"{Math.Max(1, barHeight)}\" rx=\"2\" fill=\"{ChartColors[i % ChartColors.Length]}\"/>");
            sb.AppendLine($"<text x=\"{x + barWidth / 2}\" y=\"{y - 5}\" font-size=\"11\" fill=\"#1a2332\" text-anchor=\"middle\">{value}</text>");
            sb.AppendLine($"<text x=\"{x + barWidth / 2}\" y=\"{chartHeight + 16}\" font-size=\"10\" fill=\"#5d7a8c\" text-anchor=\"middle\">{EscapeXml(label)}</text>");
        }
        sb.AppendLine("</svg>");
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string EscapeXml(string value) =>
        value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;");

    private static string FormatPeriod(DateTime? startDate, DateTime? endDate)
    {
        if (!startDate.HasValue && !endDate.HasValue) return "All time";
        var start = startDate?.ToString("yyyy-MM-dd") ?? "All time";
        var end = endDate?.ToString("yyyy-MM-dd") ?? "All time";
        return $"{start} → {end}";
    }
}
