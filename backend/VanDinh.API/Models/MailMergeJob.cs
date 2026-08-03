namespace VanDinh.API.Models;

/// <summary>
/// Persisted history record for an Automatic Form Filling (advanced mail merge) generation job.
/// </summary>
public sealed class MailMergeJob
{
    public long JobId { get; set; }

    /// <summary>Public identifier used to reference the job and its generated ZIP from the API.</summary>
    public Guid PublicId { get; set; }

    [System.ComponentModel.DataAnnotations.MaxLength(255)]
    public string TemplateFileName { get; set; } = "";

    [System.ComponentModel.DataAnnotations.MaxLength(255)]
    public string ExcelFileName { get; set; } = "";

    [System.ComponentModel.DataAnnotations.MaxLength(255)]
    public string FilenamePattern { get; set; } = "";

    /// <summary>JSON array of placeholders detected in the template, e.g. ["FullName", "Address"].</summary>
    public string? PlaceholdersJson { get; set; }

    /// <summary>JSON object mapping placeholder names to the Excel column that feeds them.</summary>
    public string? MappingJson { get; set; }

    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }

    /// <summary>Processing | Completed | Failed</summary>
    [System.ComponentModel.DataAnnotations.MaxLength(20)]
    public string Status { get; set; } = "Processing";

    /// <summary>JSON array of detailed per-row error messages (capped by MailMergeOptions.MaxStoredErrors).</summary>
    public string? ErrorsJson { get; set; }

    /// <summary>File name of the generated ZIP stored under wwwroot/uploads/mail-merge.</summary>
    [System.ComponentModel.DataAnnotations.MaxLength(255)]
    public string? ZipFileName { get; set; }

    public long CreatedBy { get; set; }

    [System.ComponentModel.DataAnnotations.MaxLength(100)]
    public string CreatedByUsername { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
