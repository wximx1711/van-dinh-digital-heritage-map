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

    public static UserDto ToDto(this User user, IReadOnlyList<Role> roles)
    {
        var role = roles.FirstOrDefault(x => x.RoleId == user.RoleId)?.RoleName ?? "";
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

    public static HeritageDto ToDto(this Heritage item, IReadOnlyList<HeritageCategory> categories)
    {
        var type = categories.FirstOrDefault(x => x.CategoryId == item.CategoryId)?.Code ?? "";
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
            item.PublicId, item.Code, item.NameVi, item.NameEn, item.Category,
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
    public static MemorialSiteDto ToDto(this MemorialSite item)
    {
        var gallery = string.IsNullOrWhiteSpace(item.GalleryImages)
            ? []
            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(item.GalleryImages) ?? [];
        return new MemorialSiteDto(
            item.PublicId, item.Code, item.NameVi, item.NameEn, item.Category,
            item.Classification, item.Status, item.OtherNames,
            item.AddressVi, item.AddressEn,
            item.Latitude.HasValue ? (double)item.Latitude : null,
            item.Longitude.HasValue ? (double)item.Longitude : null,
            item.GoogleMapUrl,
            item.DescriptionVi, item.DescriptionEn,
            item.HistoryVi, item.HistoryEn,
            item.EventDate, item.CommemorationVi, item.CommemorationEn,
            item.ImageUrl, item.VideoUrl, gallery,
            item.CreatedAt.ToString("yyyy-MM-dd"), item.UpdatedAt?.ToString("yyyy-MM-dd"));
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
}
