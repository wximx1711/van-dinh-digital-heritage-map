using System.Reflection;
using Microsoft.Extensions.Logging;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services;

public static class MappingExtensions
{
    public static UserDto ToDto(this User user, IAppRepository repository)
    {
        var role = repository.Roles.FirstOrDefault(x => x.RoleId == user.RoleId)?.RoleName ?? "";
        return new UserDto(user.UserId, user.Username, user.FullName, user.Email, role, user.Status, user.CreatedAt);
    }

    public static HeritageCategoryDto ToDto(this HeritageCategory item) =>
        new(item.CategoryId, item.Code, item.NameVi, item.NameEn, item.IconUrl);

    public static HeritageDto ToDto(this Heritage item, IAppRepository repository)
    {
        var type = repository.Categories.FirstOrDefault(x => x.CategoryId == item.CategoryId)?.Code ?? "";
        var images = item.Images.OrderBy(x => x.SortOrder).Select(x => x.ImageUrl).ToList();
        return new HeritageDto(
            item.PublicId,
            item.Code,
            item.NameVi,
            item.NameEn,
            type,
            item.Classification,
            item.Status,
            item.AddressVi,
            item.AddressEn,
            item.Latitude is null ? null : (double)item.Latitude.Value,
            item.Longitude is null ? null : (double)item.Longitude.Value,
            item.DescriptionVi,
            item.DescriptionEn,
            item.HistoryVi,
            item.HistoryEn,
            item.ThumbnailUrl,
            images,
            (item.UpdatedAt ?? item.CreatedAt).ToString("yyyy-MM-dd"),
            item.YearBuilt,
            item.Guardian,
            item.QrCodeUrl,
            item.GoogleMapUrl);
    }

    public static HeritageImageDto ToDto(this HeritageImage item) => new(item.ImageId, item.ImageUrl, item.Caption, item.SortOrder);
    public static HeritageVideoDto ToDto(this HeritageVideo item) => new(item.VideoId, item.Title, item.VideoType, item.VideoUrl, item.ThumbnailUrl);
    public static HeritageDocumentDto ToDto(this HeritageDocument item) => new(item.DocumentId, item.FileName, item.FileUrl, item.FileType, item.FileSize);
    public static IntangibleHeritageDto ToDto(this IntangibleHeritage item)
    {
        var gallery = string.IsNullOrWhiteSpace(item.GalleryImages)
            ? []
            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(item.GalleryImages) ?? [];
        return new IntangibleHeritageDto(
            item.PublicId, item.NameVi, item.NameEn, item.Category,
            item.DescriptionVi, item.DescriptionEn, item.ImageUrl, item.VideoUrl,
            item.CreatedAt.ToString("yyyy-MM-dd"), item.UpdatedAt?.ToString("yyyy-MM-dd"),
            item.OtherNames, item.Location, item.CulturalSpace,
            item.Community, item.RepresentativePersons,
            item.Origin, item.OriginEn, item.FormationHistory, item.HistoricalDevelopment,
            item.WorshipObjects, item.FestivalTime, item.FestivalDuration,
            item.FestivalLocation, item.RitualParticipants, item.RitualProcess,
            item.CustomsAndOfferings, item.FolkGames, item.TraditionalPerformances,
            item.RitualObjects, item.RelatedDocuments, item.RelatedDocumentsEn,
            item.ExistingArtisans, item.TeachingArtisans, item.Practitioners,
            item.Learners, item.OtherHumanResources, item.TransmissionMethod,
            item.CurrentStatus, item.CurrentStatusEn,
            item.ThreatLevel, item.RiskDescription,
            item.HeritageValue, item.HeritageValueEn,
            item.ExistingProtectionMeasures, item.ProposedProtectionMeasures,
            gallery);
    }
    public static ActivityLogDto ToDto(this ActivityLog item) => new(item.LogId, item.UserId, item.User?.Username ?? "system", item.User?.Role?.RoleName ?? "", item.Action, item.EntityName, item.EntityId, item.Description, item.IpAddress, item.CreatedAt);
    public static AboutPageDto ToDto(this AboutPage item) => new(item.AboutId, item.TitleVi, item.TitleEn, item.IntroductionVi, item.IntroductionEn, item.MainContentVi, item.MainContentEn, item.BannerImage, item.ContactInfo, item.UpdatedAt);
    public static AboutPageHistoryDto ToDto(this AboutPageHistory item, IReadOnlyDictionary<long, User> userLookup)
    {
        var user = userLookup.GetValueOrDefault(item.UpdatedBy);
        var editorName = user?.FullName ?? user?.Username ?? "Unknown User";
        return new AboutPageHistoryDto(item.HistoryId, item.TitleVi, item.TitleEn, item.IntroductionVi, item.IntroductionEn, item.MainContentVi, item.MainContentEn, item.BannerImage, item.ContactInfo, editorName, item.CreatedAt);
    }
    public static SystemSettingDto ToDto(this SystemSetting item) => new(item.SettingId, item.WebsiteName, item.LogoUrl, item.FooterText, item.ContactEmail, item.Phone, item.Address, item.FacebookUrl, item.TiktokUrl, item.YoutubeUrl, item.UpdatedAt);
    public static ContactMessageDto ToDto(this ContactMessage item) => new(item.Id, item.FullName, item.Email, item.Subject, item.Message, item.CreatedAt, item.IsRead, item.ReadAt, item.IPAddress, item.UserAgent);
    public static ContactMessageListItem ToListItem(this ContactMessage item) => new(item.Id, item.FullName, item.Email, item.Subject, item.CreatedAt, item.IsRead, item.ReadAt);
    public static RelatedLinkDto ToDto(this RelatedLink item) => new(item.LinkId, item.Title, item.Url, item.DisplayOrder, item.IsEnabled, item.CreatedAt);

    /// <summary>
    /// TEMPORARY DIAGNOSTIC: Logs all property values of a Heritage entity to identify NULL values in non-nullable properties.
    /// </summary>
    public static void DiagnoseHeritage(Heritage? entity, ILogger logger, string label)
    {
        if (entity is null) { logger.LogWarning("DIAGNOSTIC [{Label}] Heritage entity is NULL", label); return; }

        var props = typeof(Heritage).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        foreach (var prop in props)
        {
            if (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(List<>))
                continue;
            if (prop.Name is nameof(Heritage.Images) or nameof(Heritage.Videos) or nameof(Heritage.Documents))
                continue;

            var value = prop.GetValue(entity);
            var clrType = prop.PropertyType.Name;

            // Check for string properties that are null despite being non-nullable
            if (prop.PropertyType == typeof(string))
            {
                var strVal = (string?)value;
                if (strVal is null)
                {
                    logger.LogWarning("DIAGNOSTIC [{Label}] Heritage.{Property}: NULL — CLR type: {ClrType} (non-nullable string)", label, prop.Name, clrType);
                }
                else
                {
                    logger.LogDebug("DIAGNOSTIC [{Label}] Heritage.{Property} = \"{Val}\" ({ClrType})", label, prop.Name, strVal, clrType);
                }
            }
            else if (prop.PropertyType.IsValueType && Nullable.GetUnderlyingType(prop.PropertyType) is null)
            {
                // Non-nullable value type
                var defaultVal = Activator.CreateInstance(prop.PropertyType);
                if (Equals(value, defaultVal))
                {
                    logger.LogWarning("DIAGNOSTIC [{Label}] Heritage.{Property}: DEFAULT ({Val}) — CLR type: {ClrType} (non-nullable value type)", label, prop.Name, value ?? "null", clrType);
                }
                else
                {
                    logger.LogDebug("DIAGNOSTIC [{Label}] Heritage.{Property} = {Val} ({ClrType})", label, prop.Name, value, clrType);
                }
            }
            else
            {
                logger.LogDebug("DIAGNOSTIC [{Label}] Heritage.{Property} = {Val} ({ClrType})", label, prop.Name, value ?? "null", clrType);
            }
        }
    }

    /// <summary>
    /// TEMPORARY DIAGNOSTIC: Logs all property values of a HeritageImage entity.
    /// </summary>
    public static void DiagnoseHeritageImage(HeritageImage? entity, ILogger logger, string label)
    {
        if (entity is null) { logger.LogWarning("DIAGNOSTIC [{Label}] HeritageImage entity is NULL", label); return; }

        var props = typeof(HeritageImage).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        foreach (var prop in props)
        {
            var value = prop.GetValue(entity);
            var clrType = prop.PropertyType.Name;

            if (prop.PropertyType == typeof(string))
            {
                var strVal = (string?)value;
                if (strVal is null)
                {
                    logger.LogWarning("DIAGNOSTIC [{Label}] HeritageImage.{Property}: NULL — CLR type: {ClrType} (non-nullable string)", label, prop.Name, clrType);
                }
                else
                {
                    logger.LogDebug("DIAGNOSTIC [{Label}] HeritageImage.{Property} = \"{Val}\"", label, prop.Name, strVal);
                }
            }
            else if (prop.PropertyType.IsValueType && Nullable.GetUnderlyingType(prop.PropertyType) is null)
            {
                var defaultVal = Activator.CreateInstance(prop.PropertyType);
                if (Equals(value, defaultVal))
                {
                    logger.LogWarning("DIAGNOSTIC [{Label}] HeritageImage.{Property}: DEFAULT ({Val}) — CLR type: {ClrType} (non-nullable value type)", label, prop.Name, value ?? "null", clrType);
                }
                else
                {
                    logger.LogDebug("DIAGNOSTIC [{Label}] HeritageImage.{Property} = {Val}", label, prop.Name, value);
                }
            }
        }
    }

    /// <summary>
    /// TEMPORARY DIAGNOSTIC: Extracts and logs EF Core materialization failure details from the exception chain.
    /// </summary>
    public static void LogMaterializationError(ILogger logger, Exception ex, string context)
    {
        logger.LogError(ex, "=== MATERIALIZATION ERROR [{Context}] ===", context);
        logger.LogError("Message: {Msg}", ex.Message);

        var inner = ex.InnerException;
        var depth = 0;
        while (inner is not null)
        {
            logger.LogError("InnerException[{Depth}].Message: {Msg}", depth, inner.Message);
            logger.LogError("InnerException[{Depth}].Type: {Type}", depth, inner.GetType().FullName);
            logger.LogError("InnerException[{Depth}].StackTrace: {Stack}", depth, inner.StackTrace);
            inner = inner.InnerException;
            depth++;
        }

        logger.LogError("Exception.StackTrace: {Stack}", ex.StackTrace);

        // Try to identify the entity and property from stack trace
        var stackLines = (ex.StackTrace ?? "").Split('\n', StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in stackLines)
        {
            if (line.Contains("SqlDataReader") || line.Contains("GetString") || line.Contains("GetValue") ||
                line.Contains("ReadColumn") || line.Contains("Materialize") || line.Contains("EntityMaterializerSource"))
            {
                logger.LogError("SUSPICIOUS STACK FRAME: {Line}", line.Trim());
            }
        }

        // Check stack for entity type hints
        foreach (var line in stackLines)
        {
            var trimmed = line.Trim();
            if (trimmed.Contains("Heritage") || trimmed.Contains("HeritageImage") ||
                trimmed.Contains("HeritageVideo") || trimmed.Contains("HeritageDocument"))
            {
                logger.LogError("ENTITY-RELATED STACK FRAME: {Line}", trimmed);
            }
        }
    }
}
