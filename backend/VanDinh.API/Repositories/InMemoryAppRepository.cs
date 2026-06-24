using VanDinh.API.Models;

namespace VanDinh.API.Repositories;

public sealed class InMemoryAppRepository : IAppRepository
{
    private readonly object _lock = new();
    private readonly List<Role> _roles = [];
    private readonly List<User> _users = [];
    private readonly List<HeritageCategory> _categories = [];
    private readonly List<Heritage> _heritages = [];
    private readonly List<IntangibleHeritage> _intangible = [];
    private readonly List<ActivityLog> _logs = [];

    private long _userId = 1;
    private int _categoryId = 1;
    private long _heritageId = 1;
    private long _imageId = 1;
    private long _videoId = 1;
    private long _documentId = 1;
    private long _intangibleId = 1;
    private long _logId = 1;

    public InMemoryAppRepository()
    {
        Seed();
    }

    public IReadOnlyList<Role> Roles => _roles;
    public IReadOnlyList<User> Users => _users;
    public IReadOnlyList<HeritageCategory> Categories => _categories;
    public IReadOnlyList<Heritage> Heritages => _heritages.Where(x => !x.IsDeleted).ToList();
    public IReadOnlyList<IntangibleHeritage> IntangibleHeritages => _intangible.Where(x => !x.IsDeleted).ToList();
    public IReadOnlyList<ActivityLog> ActivityLogs => _logs.OrderByDescending(x => x.CreatedAt).ToList();
    public AboutPage AboutPage { get; set; } = new();
    public SystemSetting SystemSetting { get; set; } = new();

    public Role? FindRole(string roleName) => _roles.FirstOrDefault(x => string.Equals(x.RoleName, roleName, StringComparison.OrdinalIgnoreCase));
    public User? FindUser(long userId) => _users.FirstOrDefault(x => x.UserId == userId);
    public User? FindUser(string username) => _users.FirstOrDefault(x => string.Equals(x.Username, username, StringComparison.OrdinalIgnoreCase));

    public User AddUser(User user)
    {
        lock (_lock)
        {
            user.UserId = _userId++;
            user.CreatedAt = DateTime.UtcNow;
            _users.Add(user);
            return user;
        }
    }

    public void UpdateUser(User user) => user.UpdatedAt = DateTime.UtcNow;
    public void DeleteUser(long userId) => _users.RemoveAll(x => x.UserId == userId);

    public HeritageCategory? FindCategory(int id) => _categories.FirstOrDefault(x => x.CategoryId == id);
    public HeritageCategory? FindCategory(string code) => _categories.FirstOrDefault(x => string.Equals(x.Code, code, StringComparison.OrdinalIgnoreCase));

    public HeritageCategory AddCategory(HeritageCategory category)
    {
        lock (_lock)
        {
            category.CategoryId = _categoryId++;
            _categories.Add(category);
            return category;
        }
    }

    public void UpdateCategory(HeritageCategory category) { }
    public void DeleteCategory(int id) => _categories.RemoveAll(x => x.CategoryId == id);

    public Heritage? FindHeritage(long id) => _heritages.FirstOrDefault(x => x.HeritageId == id && !x.IsDeleted);
    public Heritage? FindHeritage(string publicId) => _heritages.FirstOrDefault(x => string.Equals(x.PublicId, publicId, StringComparison.OrdinalIgnoreCase) && !x.IsDeleted);

    public Heritage AddHeritage(Heritage heritage)
    {
        lock (_lock)
        {
            heritage.HeritageId = _heritageId++;
            heritage.PublicId = $"h{heritage.HeritageId:000}";
            heritage.CreatedAt = DateTime.UtcNow;
            _heritages.Add(heritage);
            return heritage;
        }
    }

    public void UpdateHeritage(Heritage heritage) => heritage.UpdatedAt = DateTime.UtcNow;
    public void DeleteHeritage(string publicId)
    {
        var item = FindHeritage(publicId);
        if (item is null) return;
        item.IsDeleted = true;
        item.DeletedAt = DateTime.UtcNow;
    }

    public HeritageImage AddImage(string publicId, HeritageImage image)
    {
        var heritage = FindHeritage(publicId) ?? throw new InvalidOperationException("Heritage not found.");
        lock (_lock)
        {
            image.ImageId = _imageId++;
            image.HeritageId = heritage.HeritageId;
            heritage.Images.Add(image);
            heritage.ThumbnailUrl ??= image.ImageUrl;
            return image;
        }
    }

    public void DeleteImage(string publicId, long imageId)
    {
        var heritage = FindHeritage(publicId);
        heritage?.Images.RemoveAll(x => x.ImageId == imageId);
    }

    public HeritageVideo AddVideo(string publicId, HeritageVideo video)
    {
        var heritage = FindHeritage(publicId) ?? throw new InvalidOperationException("Heritage not found.");
        lock (_lock)
        {
            video.VideoId = _videoId++;
            video.HeritageId = heritage.HeritageId;
            heritage.Videos.Add(video);
            return video;
        }
    }

    public void DeleteVideo(string publicId, long videoId) => FindHeritage(publicId)?.Videos.RemoveAll(x => x.VideoId == videoId);

    public HeritageDocument AddDocument(string publicId, HeritageDocument document)
    {
        var heritage = FindHeritage(publicId) ?? throw new InvalidOperationException("Heritage not found.");
        lock (_lock)
        {
            document.DocumentId = _documentId++;
            document.HeritageId = heritage.HeritageId;
            heritage.Documents.Add(document);
            return document;
        }
    }

    public void DeleteDocument(string publicId, long documentId) => FindHeritage(publicId)?.Documents.RemoveAll(x => x.DocumentId == documentId);

    public IntangibleHeritage? FindIntangible(string publicId) => _intangible.FirstOrDefault(x => string.Equals(x.PublicId, publicId, StringComparison.OrdinalIgnoreCase) && !x.IsDeleted);

    public IntangibleHeritage AddIntangible(IntangibleHeritage item)
    {
        lock (_lock)
        {
            item.IntangibleId = _intangibleId++;
            item.PublicId = $"i{item.IntangibleId:000}";
            _intangible.Add(item);
            return item;
        }
    }

    public void UpdateIntangible(IntangibleHeritage item) => item.UpdatedAt = DateTime.UtcNow;
    public void DeleteIntangible(string publicId)
    {
        var item = FindIntangible(publicId);
        if (item is null) return;
        item.IsDeleted = true;
        item.UpdatedAt = DateTime.UtcNow;
    }

    public ActivityLog AddLog(ActivityLog log)
    {
        lock (_lock)
        {
            log.LogId = _logId++;
            log.CreatedAt = DateTime.UtcNow;
            _logs.Add(log);
            return log;
        }
    }

    private void Seed()
    {
        _roles.AddRange([
            new Role { RoleId = 1, RoleName = "ADMIN" },
            new Role { RoleId = 2, RoleName = "MANAGER" },
            new Role { RoleId = 3, RoleName = "VISITOR" }
        ]);
        _userId = 2;
        _users.Add(new User
        {
            UserId = 1,
            RoleId = 1,
            Username = "admin",
            PasswordHash = "admin123",
            FullName = "Quan tri vien he thong",
            Email = "admin@vandinh.vn",
            Status = true,
            Role = _roles[0]
        });

        foreach (var category in new[]
        {
            ("dinh", "Dinh", "Communal House"), ("chua", "Chua", "Pagoda"), ("den", "Den", "Temple"),
            ("mieu", "Mieu", "Shrine"), ("phu", "Phu", "Palace"), ("quan", "Quan", "Taoist Temple"),
            ("nhacu", "Nha co", "Ancient House"), ("nhatho", "Nha tho ho", "Clan House"), ("lang", "Lang mo", "Mausoleum")
        })
        {
            _categories.Add(new HeritageCategory { CategoryId = _categoryId++, Code = category.Item1, NameVi = category.Item2, NameEn = category.Item3, IconUrl = $"/icons/{category.Item1}.png" });
        }

        AddSeedHeritage("h001", "VDHN-DT-001", "dinh", "Dinh Van Dinh", "Van Dinh Communal House", "national", "active", 20.756m, 105.853m);
        AddSeedHeritage("h002", "VDHN-DT-002", "chua", "Chua Boi Khe", "Boi Khe Pagoda", "national", "active", 20.748m, 105.849m);
        AddSeedHeritage("h003", "VDHN-DT-003", "den", "Den Van Dinh", "Van Dinh Temple", "city", "active", 20.762m, 105.858m);
        AddSeedHeritage("h004", "VDHN-DT-004", "mieu", "Mieu Thon Giua", "Middle Village Shrine", "unranked", "active", 20.752m, 105.851m);
        AddSeedHeritage("h005", "VDHN-DT-005", "nhatho", "Nha tho ho Dang", "Dang Clan Ancestral House", "unranked", "active", 20.746m, 105.847m);
        AddSeedHeritage("h006", "VDHN-DT-006", "chua", "Chua Thanh Dinh", "Thanh Dinh Pagoda", "city", "maintenance", 20.759m, 105.862m);
        AddSeedHeritage("h007", "VDHN-DT-007", "lang", "Lang Mo Cu Nguyen Van Tho", "Nguyen Van Tho Mausoleum", "unranked", "active", 20.744m, 105.845m);
        AddSeedHeritage("h008", "VDHN-DT-008", "dinh", "Dinh Huong Tao", "Huong Tao Communal House", "city", "active", 20.765m, 105.864m);
        AddSeedHeritage("h009", "VDHN-DT-009", "phu", "Phu Van Dinh", "Van Dinh Palace", "unranked", "active", 20.757m, 105.848m);
        AddSeedHeritage("h010", "VDHN-DT-010", "quan", "Quan Thi Cau", "Thi Cau Taoist Temple", "unranked", "closed", 20.749m, 105.857m);

        foreach (var item in new[]
        {
            ("i001", "Le hoi Dinh Van Dinh", "Van Dinh Communal House Festival", "festival"),
            ("i002", "Hat Cheo Van Dinh", "Van Dinh Cheo Folk Opera", "performance"),
            ("i003", "Nghe det lua truyen thong", "Traditional Silk Weaving", "craft"),
            ("i004", "Le gio to dong ho", "Clan Ancestor Commemoration", "ritual"),
            ("i005", "Truyen thuyet Than song Day", "Legend of the Day River Spirit", "story")
        })
        {
            _intangible.Add(new IntangibleHeritage
            {
                IntangibleId = _intangibleId++,
                PublicId = item.Item1,
                NameVi = item.Item2,
                NameEn = item.Item3,
                Category = item.Item4,
                DescriptionVi = "Noi dung dang duoc cap nhat.",
                DescriptionEn = "Content is being updated.",
                ImageUrl = "https://images.unsplash.com/photo-1578409682213-e27b3355cad7?w=800&h=500&fit=crop&auto=format"
            });
        }

        AboutPage = new AboutPage { AboutId = 1, Title = "Gioi thieu Xa Van Dinh", Content = "Noi dung gioi thieu se duoc cap nhat tai day.", UpdatedBy = 1 };
        SystemSetting = new SystemSetting { SettingId = 1, WebsiteName = "Ban do so Xa Van Dinh", ContactEmail = "contact@vandinh.vn", Phone = "0123456789", Address = "Xa Van Dinh, Thanh pho Ha Noi", FooterText = "Ban do so Xa Van Dinh" };
    }

    private void AddSeedHeritage(string publicId, string code, string categoryCode, string nameVi, string nameEn, string classification, string status, decimal lat, decimal lon)
    {
        var category = FindCategory(categoryCode)!;
        var id = _heritageId++;
        var image = "https://images.unsplash.com/photo-1571842533456-9b0d746c5a9b?w=800&h=500&fit=crop&auto=format";
        _heritages.Add(new Heritage
        {
            HeritageId = id,
            PublicId = publicId,
            Code = code,
            CategoryId = category.CategoryId,
            NameVi = nameVi,
            NameEn = nameEn,
            Slug = publicId,
            Classification = classification,
            Status = status,
            AddressVi = "Xa Van Dinh, Ha Noi",
            AddressEn = "Van Dinh Commune, Hanoi",
            Latitude = lat,
            Longitude = lon,
            DescriptionVi = $"{nameVi} la mot diem di san cua xa Van Dinh.",
            DescriptionEn = $"{nameEn} is a heritage site in Van Dinh Commune.",
            HistoryVi = "Thong tin lich su dang duoc cap nhat.",
            HistoryEn = "Historical information is being updated.",
            ThumbnailUrl = image,
            YearBuilt = "Dang cap nhat",
            Guardian = "Ban Quan ly Di tich Van Dinh",
            CreatedBy = 1,
            Images = [new HeritageImage { ImageId = _imageId++, HeritageId = id, ImageUrl = image, SortOrder = 1 }]
        });
    }
}
