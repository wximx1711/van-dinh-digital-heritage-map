using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services;

public interface IHeritageService
{
    IReadOnlyList<HeritageDto> Search(string? query, string? type, string? classification, string? status);
    HeritageDto? Get(string id);
    HeritageDto Create(HeritageRequest request, long userId);
    HeritageDto? Update(string id, HeritageRequest request);
    bool Delete(string id);
}

public sealed class HeritageService(IAppRepository repository) : IHeritageService
{
    public IReadOnlyList<HeritageDto> Search(string? query, string? type, string? classification, string? status)
    {
        var items = repository.Heritages.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            items = items.Where(x => x.NameVi.Contains(query, StringComparison.OrdinalIgnoreCase)
                || x.NameEn.Contains(query, StringComparison.OrdinalIgnoreCase)
                || x.Code.Contains(query, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(type))
        {
            var category = repository.FindCategory(type);
            items = items.Where(x => category is not null && x.CategoryId == category.CategoryId);
        }
        if (!string.IsNullOrWhiteSpace(classification)) items = items.Where(x => x.Classification == classification);
        if (!string.IsNullOrWhiteSpace(status)) items = items.Where(x => x.Status == status);
        return items.OrderBy(x => x.Code).Select(x => x.ToDto(repository)).ToList();
    }

    public HeritageDto? Get(string id) => repository.FindHeritage(id)?.ToDto(repository);

    public HeritageDto Create(HeritageRequest request, long userId)
    {
        var category = repository.FindCategory(request.Type) ?? throw new InvalidOperationException("Category not found.");
        var heritage = new Heritage
        {
            Code = request.Code,
            CategoryId = category.CategoryId,
            NameVi = request.NameVi,
            NameEn = request.NameEn,
            Slug = Slugify(request.NameEn),
            Classification = request.Classification,
            Status = request.Status,
            AddressVi = request.AddressVi,
            AddressEn = request.AddressEn,
            DescriptionVi = request.DescriptionVi,
            DescriptionEn = request.DescriptionEn,
            HistoryVi = request.HistoryVi,
            HistoryEn = request.HistoryEn,
            ThumbnailUrl = request.Image,
            YearBuilt = request.YearBuilt,
            Guardian = request.Guardian,
            CreatedBy = userId,
            GoogleMapUrl = request.GoogleMapUrl
        };
        repository.AddHeritage(heritage);
        heritage.QrCodeUrl = $"/api/qr/heritage/{heritage.PublicId}";
        if (!string.IsNullOrWhiteSpace(request.Image))
        {
            repository.AddImage(heritage.PublicId, new HeritageImage { ImageUrl = request.Image, SortOrder = 1 });
        }
        return heritage.ToDto(repository);
    }

    public HeritageDto? Update(string id, HeritageRequest request)
    {
        var heritage = repository.FindHeritage(id);
        var category = repository.FindCategory(request.Type);
        if (heritage is null || category is null) return null;

        heritage.Code = request.Code;
        heritage.CategoryId = category.CategoryId;
        heritage.NameVi = request.NameVi;
        heritage.NameEn = request.NameEn;
        heritage.Classification = request.Classification;
        heritage.Status = request.Status;
        heritage.AddressVi = request.AddressVi;
        heritage.AddressEn = request.AddressEn;
        heritage.DescriptionVi = request.DescriptionVi;
        heritage.DescriptionEn = request.DescriptionEn;
        heritage.HistoryVi = request.HistoryVi;
        heritage.HistoryEn = request.HistoryEn;
        heritage.ThumbnailUrl = request.Image;
        heritage.YearBuilt = request.YearBuilt;
        heritage.Guardian = request.Guardian;
        heritage.GoogleMapUrl = request.GoogleMapUrl;
        repository.UpdateHeritage(heritage);
        return heritage.ToDto(repository);
    }

    public bool Delete(string id)
    {
        if (repository.FindHeritage(id) is null) return false;
        repository.DeleteHeritage(id);
        return true;
    }

    private static string Slugify(string value)
    {
        var chars = value.ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
        return string.Join('-', new string(chars).Split('-', StringSplitOptions.RemoveEmptyEntries));
    }
}
