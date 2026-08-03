using System.Text;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
namespace VanDinh.API.Services.MailMerge;

/// <summary>
/// Replaces {{Placeholder}} tokens inside a .docx template with row values while preserving
/// every formatting detail of the original document (fonts, sizes, colors, tables, images,
/// headers, footers, page layout, alignment, ...). Only the text of matched tokens changes.
/// </summary>
public interface IMailMergeDocumentGenerator
{
    /// <summary>
    /// Produces a personalized copy of the template for one data row.
    /// Placeholders that are not present in <paramref name="values"/> are replaced with an empty string.
    /// </summary>
    byte[] Generate(byte[] templateBytes, IReadOnlyDictionary<string, string> values);
}

public sealed partial class MailMergeDocumentGenerator : IMailMergeDocumentGenerator
{
    [GeneratedRegex(@"\{\{\s*([A-Za-z0-9_.]+)\s*\}\}")]
    private static partial Regex PlaceholderRegex();

    public byte[] Generate(byte[] templateBytes, IReadOnlyDictionary<string, string> values)
    {
        using var stream = new MemoryStream(templateBytes.Length);
        stream.Write(templateBytes, 0, templateBytes.Length);
        stream.Position = 0;

        using var document = WordprocessingDocument.Open(stream, true);

        foreach (var part in MailMergePlaceholderExtractor.EnumerateTextParts(document))
        {
            ReplaceInPart(part, values);
        }

        // Flush every edited part back into the package.
        if (document.MainDocumentPart is { } mainPart)
        {
            mainPart.Document.Save();
            foreach (var header in mainPart.HeaderParts)
            {
                header.Header.Save();
            }
            foreach (var footer in mainPart.FooterParts)
            {
                footer.Footer.Save();
            }
        }

        document.Save();
        return stream.ToArray();
    }

    private static void ReplaceInPart(OpenXmlElement part, IReadOnlyDictionary<string, string> values)
    {
        foreach (var paragraph in part.Descendants<Paragraph>())
        {
            var elements = paragraph.Descendants<Text>().ToList();
            if (elements.Count == 0)
            {
                continue;
            }

            // Cumulative start offset of every Text element within this paragraph.
            var offsets = new int[elements.Count];
            var fullLength = 0;
            for (var i = 0; i < elements.Count; i++)
            {
                offsets[i] = fullLength;
                fullLength += elements[i].Text?.Length ?? 0;
            }

            var text = new StringBuilder(fullLength);
            foreach (var element in elements)
            {
                text.Append(element.Text);
            }

            // Collect matches, then process from the end of the paragraph backwards so the
            // original offsets stay valid while earlier matches are still unresolved.
            var matches = PlaceholderRegex().Matches(text.ToString())
                .Cast<Match>()
                .OrderByDescending(m => m.Index)
                .ToList();

            foreach (var match in matches)
            {
                var start = match.Index;
                var end = start + match.Length;
                values.TryGetValue(match.Groups[1].Value, out var value);
                ReplaceSpan(elements, offsets, fullLength, start, end, value ?? "");
            }
        }
    }

    /// <summary>
    /// Replaces the character span [start, end) of the original paragraph text.
    /// The span may cover several Text elements (a placeholder split across runs).
    /// </summary>
    private static void ReplaceSpan(List<Text> elements, int[] offsets, int fullLength, int start, int end, string value)
    {
        if (start < 0 || end > fullLength || end <= start)
        {
            return;
        }

        var firstIndex = FindElementContaining(offsets, elements.Count, start);
        var lastIndex = FindElementContaining(offsets, elements.Count, end - 1);

        var first = elements[firstIndex];
        var prefix = first.Text![..(start - offsets[firstIndex])];

        var segments = value.Split('\n');
        var last = elements[lastIndex];
        var suffix = lastIndex == firstIndex
            ? first.Text![(end - offsets[firstIndex])..]
            : last.Text![(end - offsets[lastIndex])..];

        // Strip the original text that is covered by the placeholder.
        first.Text = prefix;
        MarkPreserveSpace(first);
        for (var i = firstIndex + 1; i < lastIndex; i++)
        {
            elements[i].Text = "";
            MarkPreserveSpace(elements[i]);
        }
        if (lastIndex != firstIndex)
        {
            last.Text = suffix;
            MarkPreserveSpace(last);
        }

        if (segments.Length == 1)
        {
            if (lastIndex == firstIndex)
            {
                first.Text = prefix + value + suffix;
                MarkPreserveSpace(first);
            }
            else
            {
                first.Text = prefix + value;
                MarkPreserveSpace(first);
            }
            return;
        }

        // Multi-line value: insert a cloned run (same formatting) with line breaks
        // right after the run that held the start of the placeholder.
        var run = (Run)first.Parent!;
        var newRun = CloneRun(run);
        var paragraph = (Paragraph)run.Parent!;
        paragraph.InsertAfter(newRun, run);

        for (var i = 0; i < segments.Length; i++)
        {
            if (i > 0)
            {
                newRun.AppendChild(new Break());
            }
            var text = new Text(segments[i]) { Space = SpaceProcessingModeValues.Preserve };
            newRun.AppendChild(text);
        }

        if (lastIndex == firstIndex)
        {
            // Suffix belongs right after the injected value, inside the cloned run,
            // so the original run keeps only its prefix.
            var lastText = newRun.Elements<Text>().Last();
            lastText.Text = lastText.Text + suffix;
            first.Text = prefix;
            MarkPreserveSpace(first);
        }
    }

    private static int FindElementContaining(int[] offsets, int count, int charIndex)
    {
        // Offsets are sorted; find the last element whose start offset is <= charIndex.
        var low = 0;
        var high = count - 1;
        var result = 0;
        while (low <= high)
        {
            var mid = (low + high) / 2;
            if (offsets[mid] <= charIndex)
            {
                result = mid;
                low = mid + 1;
            }
            else
            {
                high = mid - 1;
            }
        }
        return result;
    }

    private static Run CloneRun(Run source)
    {
        var clone = new Run();
        if (source.RunProperties is { } properties)
        {
            clone.AppendChild((RunProperties)properties.CloneNode(deep: true));
        }
        return clone;
    }

    private static void MarkPreserveSpace(Text element)
    {
        element.Space = SpaceProcessingModeValues.Preserve;
    }
}
