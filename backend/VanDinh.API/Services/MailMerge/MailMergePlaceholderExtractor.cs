using System.Text.RegularExpressions;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace VanDinh.API.Services.MailMerge;

/// <summary>
/// Detects {{Placeholder}} tokens inside a Word (.docx) document.
/// Tokens may be split across multiple runs/formatting spans within the same paragraph.
/// </summary>
public interface IMailMergePlaceholderExtractor
{
    IReadOnlyList<string> ExtractPlaceholders(byte[] templateBytes);
}

public sealed partial class MailMergePlaceholderExtractor : IMailMergePlaceholderExtractor
{
    [GeneratedRegex(@"\{\{\s*([A-Za-z0-9_.]+)\s*\}\}")]
    private static partial Regex PlaceholderRegex();

    public IReadOnlyList<string> ExtractPlaceholders(byte[] templateBytes)
    {
        var placeholders = new List<string>();
        using var stream = new MemoryStream(templateBytes, writable: false);

        WordprocessingDocument document;
        try
        {
            document = WordprocessingDocument.Open(stream, false);
        }
        catch (Exception ex) when (ex is System.IO.FileFormatException or DocumentFormat.OpenXml.Packaging.OpenXmlPackageException or InvalidDataException)
        {
            throw new InvalidOperationException(
                "The Word template file is corrupted or is not a valid .docx file.", ex);
        }

        using (document)
        {
            foreach (var part in EnumerateTextParts(document))
            {
                foreach (var paragraph in part.Descendants<Paragraph>())
                {
                    var text = string.Concat(paragraph.Descendants<Text>().Select(t => t.Text));
                    foreach (Match match in PlaceholderRegex().Matches(text))
                    {
                        var name = match.Groups[1].Value;
                        if (!placeholders.Contains(name))
                        {
                            placeholders.Add(name);
                        }
                    }
                }
            }
        }

        return placeholders;
    }

    /// <summary>
    /// Enumerates the main document body, all headers and all footers so placeholders
    /// are detected everywhere text can live.
    /// </summary>
    public static IEnumerable<OpenXmlElement> EnumerateTextParts(WordprocessingDocument document)
    {
        if (document.MainDocumentPart is { } mainPart)
        {
            yield return mainPart.Document;
            foreach (var header in mainPart.HeaderParts)
            {
                yield return header.Header;
            }
            foreach (var footer in mainPart.FooterParts)
            {
                yield return footer.Footer;
            }
        }
    }
}
