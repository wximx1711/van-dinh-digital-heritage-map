using System.Text;
using System.Text.RegularExpressions;

namespace VanDinh.API.Services.MailMerge;

/// <summary>A generated output file name before uniqueness enforcement.</summary>
public sealed record GeneratedFileName(string Name, IReadOnlyList<string> ReferencedPlaceholders);

/// <summary>
/// Builds the output file name for one data row from a user-defined pattern such as
/// <c>Invitation-{{FullName}}</c>, sanitizes it for the file system and de-duplicates it
/// within the batch.
/// </summary>
public interface IMailMergeFileNameGenerator
{
    GeneratedFileName Build(string pattern, IReadOnlyDictionary<string, string> values, int rowIndex);
    string EnsureUnique(string name, ISet<string> usedNames);
    string Sanitize(string name, int rowIndex);
}

public sealed partial class MailMergeFileNameGenerator : IMailMergeFileNameGenerator
{
    private const int MaxNameLength = 180;

    [GeneratedRegex(@"\{\{\s*([A-Za-z0-9_.]+)\s*\}\}")]
    private static partial Regex PlaceholderRegex();

    [GeneratedRegex(@"[<>:""/\\|?*]")]
    private static partial Regex InvalidFileNameChars();

    [GeneratedRegex(@"[\x00-\x1F]")]
    private static partial Regex ControlChars();

    public GeneratedFileName Build(string pattern, IReadOnlyDictionary<string, string> values, int rowIndex)
    {
        var referenced = new List<string>();

        if (string.IsNullOrWhiteSpace(pattern))
        {
            return new GeneratedFileName(Sanitize("", rowIndex), referenced);
        }

        var builder = new StringBuilder(pattern);
        foreach (Match match in PlaceholderRegex().Matches(pattern).Cast<Match>().Reverse())
        {
            var name = match.Groups[1].Value;
            referenced.Add(name);
            values.TryGetValue(name, out var value);
            builder.Remove(match.Index, match.Length);
            builder.Insert(match.Index, value ?? "");
        }

        return new GeneratedFileName(Sanitize(builder.ToString(), rowIndex), referenced);
    }

    public string EnsureUnique(string name, ISet<string> usedNames)
    {
        var candidate = name;
        var counter = 2;
        while (usedNames.Contains(candidate))
        {
            var extension = Path.GetExtension(name);
            var baseName = extension.Length > 0 ? name[..^extension.Length] : name;
            candidate = $"{baseName} ({counter}){extension}";
            counter++;
        }
        usedNames.Add(candidate);
        return candidate;
    }

    public string Sanitize(string name, int rowIndex)
    {
        var sanitized = name ?? "";
        sanitized = InvalidFileNameChars().Replace(sanitized, "");
        sanitized = ControlChars().Replace(sanitized, "");
        sanitized = sanitized.Replace("\r", " ").Replace("\n", " ").Trim();
        sanitized = string.Join(" ", sanitized.Split(' ', StringSplitOptions.RemoveEmptyEntries));

        while (sanitized.Length > 0 && (sanitized.EndsWith('.') || sanitized.EndsWith(' ')))
        {
            sanitized = sanitized[..^1];
        }

        if (sanitized.Length > MaxNameLength)
        {
            sanitized = sanitized[..MaxNameLength].TrimEnd('.', ' ');
        }

        if (sanitized.Length == 0 || string.Equals(sanitized, ".", StringComparison.Ordinal) || string.Equals(sanitized, "..", StringComparison.Ordinal))
        {
            sanitized = $"Document-{rowIndex}";
        }

        return sanitized;
    }
}
