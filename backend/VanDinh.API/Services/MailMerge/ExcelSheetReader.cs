using ClosedXML.Excel;
using VanDinh.API.DTOs;

namespace VanDinh.API.Services.MailMerge;

/// <summary>Raw data extracted from an uploaded .xlsx workbook.</summary>
public sealed record ExcelSheetData(
    IReadOnlyList<MailMergeColumnDto> Columns,
    IReadOnlyList<IReadOnlyDictionary<string, string>> Rows,
    int EmptyRowCount);

/// <summary>
/// Reads citizen data from an .xlsx file: the first non-empty row is treated as the header
/// (column names), every following row is one data record. Fully empty rows are skipped.
/// </summary>
public interface IExcelSheetReader
{
    ExcelSheetData Read(byte[] fileBytes, int maxRows);
}

public sealed class ExcelSheetReader : IExcelSheetReader
{
    public ExcelSheetData Read(byte[] fileBytes, int maxRows)
    {
        using var stream = new MemoryStream(fileBytes, writable: false);

        XLWorkbook workbook;
        try
        {
            workbook = new XLWorkbook(stream);
        }
        catch (Exception ex) when (ex is System.IO.FileFormatException or InvalidDataException)
        {
            throw new InvalidOperationException(
                "The Excel data file is corrupted or is not a valid .xlsx file.", ex);
        }

        using (workbook)
        {
            if (workbook.Worksheets.Count == 0)
            {
                throw new InvalidOperationException("The Excel file does not contain any worksheets.");
            }

            var worksheet = workbook.Worksheets.First();
            var usedRange = worksheet.RangeUsed();
            if (usedRange is null)
            {
                throw new InvalidOperationException("The Excel file does not contain any data.");
            }

            var firstRow = usedRange.FirstRow().RowNumber();
            var headerRow = worksheet.Row(firstRow);

            var columns = new List<MailMergeColumnDto>();
            var headerToColumn = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var cell in headerRow.CellsUsed())
            {
                var header = CellText(cell);
                if (string.IsNullOrWhiteSpace(header))
                {
                    continue;
                }

                var columnName = header.Trim();
                var index = cell.Address.ColumnNumber;
                var baseName = columnName;
                var suffix = 2;
                while (headerToColumn.ContainsKey(baseName))
                {
                    baseName = $"{columnName} ({suffix++})";
                }
                headerToColumn[baseName] = baseName;
                columns.Add(new MailMergeColumnDto(baseName, index, null));
            }

            if (columns.Count == 0)
            {
                throw new InvalidOperationException("The Excel file header row does not contain any column names.");
            }

            var rows = new List<IReadOnlyDictionary<string, string>>();
            var emptyRowCount = 0;

            var lastRow = usedRange.LastRow().RowNumber();
            for (var rowNumber = firstRow + 1; rowNumber <= lastRow; rowNumber++)
            {
                var row = worksheet.Row(rowNumber);
                var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                var anyValue = false;

                foreach (var column in columns)
                {
                    var cell = row.Cell(column.Index);
                    var value = CellText(cell);
                    values[column.Name] = value;
                    if (value.Length > 0)
                    {
                        anyValue = true;
                    }
                }

                if (!anyValue)
                {
                    emptyRowCount++;
                    continue;
                }

                if (rows.Count >= maxRows)
                {
                    throw new InvalidOperationException(
                        $"The Excel file contains more than {maxRows} data rows. Please split the file into smaller batches.");
                }

                rows.Add(values);
            }

            for (var i = 0; i < columns.Count; i++)
            {
                var sample = rows
                    .Select(r => r.GetValueOrDefault(columns[i].Name) ?? "")
                    .FirstOrDefault(v => v.Length > 0);
                columns[i] = columns[i] with { SampleValue = sample };
            }

            return new ExcelSheetData(columns, rows, emptyRowCount);
        }
    }

    private static string CellText(IXLCell cell)
    {
        if (cell.IsEmpty())
        {
            return "";
        }

        if (cell.HasRichText)
        {
            return cell.GetRichText().Text.Trim();
        }

        var formatted = cell.GetFormattedString();
        return (formatted ?? "").Trim();
    }
}
