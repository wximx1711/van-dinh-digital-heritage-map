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
    public static IntangibleHeritageDto ToDto(this IntangibleHeritage item) => new(item.PublicId, item.NameVi, item.NameEn, item.Category, item.DescriptionVi, item.DescriptionEn, item.ImageUrl, item.VideoUrl);
    public static ActivityLogDto ToDto(this ActivityLog item) => new(item.LogId, item.UserId, item.User?.Username ?? "system", item.Action, item.EntityName, item.EntityId, item.Description, item.CreatedAt);
    public static AboutPageDto ToDto(this AboutPage item) => new(item.AboutId, item.Title, item.Content, item.BannerImage, item.UpdatedAt);
    public static SystemSettingDto ToDto(this SystemSetting item) => new(item.SettingId, item.WebsiteName, item.LogoUrl, item.FooterText, item.ContactEmail, item.Phone, item.Address, item.FacebookUrl, item.TiktokUrl);
    public static MonthlyUpdateDto ToDto(this MonthlyUpdate item) => new(item.UpdateId, item.MonthLabel, item.DisplayVi, item.DisplayEn, item.UpdateCount);
}
