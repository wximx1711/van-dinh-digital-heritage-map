using Microsoft.EntityFrameworkCore;
using VanDinh.API.Data;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services;

public sealed class EfAppRepository(ApplicationDbContext context) : IAppRepository
{
    private readonly ApplicationDbContext _context = context;

    public IReadOnlyList<Role> Roles => _context.Roles.AsNoTracking().ToList();
    public IReadOnlyList<User> Users => _context.Users.AsNoTracking().Include(u => u.Role).ToList();

    public IReadOnlyList<HeritageCategory> Categories => _context.HeritageCategories.AsNoTracking().ToList();
    public IReadOnlyList<Heritage> Heritages => _context.Heritage
        .AsNoTracking()
        .Include(h => h.Images)
        .Include(h => h.Videos)
        .Include(h => h.Documents)
        .Where(h => !h.IsDeleted)
        .ToList();

    public IReadOnlyList<IntangibleHeritage> IntangibleHeritages => _context.IntangibleHeritages
        .AsNoTracking()
        .Where(i => !i.IsDeleted)
        .ToList();

    public IReadOnlyList<ActivityLog> ActivityLogs => _context.ActivityLogs
        .AsNoTracking()
        .Include(l => l.User)
        .OrderByDescending(l => l.CreatedAt)
        .ToList();

    public IReadOnlyList<MonthlyUpdate> MonthlyUpdates => _context.MonthlyUpdates.AsNoTracking().OrderBy(m => m.UpdateId).ToList();

    AboutPage? _aboutPage;
    public AboutPage AboutPage
    {
        get
        {
            var existing = _context.AboutPages.Local.FirstOrDefault();
            if (existing is not null) return existing;
            var fromDb = _context.AboutPages.AsNoTracking().FirstOrDefault() ?? new AboutPage();
            if (fromDb.AboutId != 0)
            {
                _context.AboutPages.Attach(fromDb);
            }
            else
            {
                _context.AboutPages.Add(fromDb);
            }
            return _aboutPage = fromDb;
        }
        set => _aboutPage = value;
    }

    SystemSetting? _systemSetting;
    public SystemSetting SystemSetting
    {
        get
        {
            var existing = _context.SystemSettings.Local.FirstOrDefault();
            if (existing is not null) return existing;
            var fromDb = _context.SystemSettings.AsNoTracking().FirstOrDefault() ?? new SystemSetting();
            if (fromDb.SettingId != 0)
            {
                _context.SystemSettings.Attach(fromDb);
            }
            else
            {
                _context.SystemSettings.Add(fromDb);
            }
            return _systemSetting = fromDb;
        }
        set => _systemSetting = value;
    }

    public Role? FindRole(string roleName) => _context.Roles
        .AsNoTracking()
        .FirstOrDefault(x => x.RoleName == roleName);

    public User? FindUser(long userId) => _context.Users
        .AsNoTracking()
        .Include(u => u.Role)
        .FirstOrDefault(x => x.UserId == userId);

    public User? FindUser(string username) => _context.Users
        .AsNoTracking()
        .Include(u => u.Role)
        .FirstOrDefault(x => x.Username == username);

    public User AddUser(User user)
    {
        user.CreatedAt = DateTime.UtcNow;
        _context.Users.Add(user);
        _context.SaveChanges();
        return user;
    }

    public void UpdateUser(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        _context.SaveChanges();
    }

    public void DeleteUser(long userId)
    {
        var user = _context.Users.Find(userId);
        if (user is not null)
        {
            _context.Users.Remove(user);
            _context.SaveChanges();
        }
    }

    public HeritageCategory? FindCategory(int id) => _context.HeritageCategories
        .AsNoTracking()
        .FirstOrDefault(x => x.CategoryId == id);

    public HeritageCategory? FindCategory(string code) => _context.HeritageCategories
        .AsNoTracking()
        .FirstOrDefault(x => x.Code == code);

    public HeritageCategory AddCategory(HeritageCategory category)
    {
        _context.HeritageCategories.Add(category);
        _context.SaveChanges();
        return category;
    }

    public void UpdateCategory(HeritageCategory category)
    {
        _context.HeritageCategories.Update(category);
        _context.SaveChanges();
    }

    public void DeleteCategory(int id)
    {
        var category = _context.HeritageCategories.Find(id);
        if (category is not null)
        {
            _context.HeritageCategories.Remove(category);
            _context.SaveChanges();
        }
    }

    public Heritage? FindHeritage(long id) => _context.Heritage
        .AsNoTracking()
        .Include(h => h.Images)
        .Include(h => h.Videos)
        .Include(h => h.Documents)
        .FirstOrDefault(h => h.HeritageId == id && !h.IsDeleted);

    public Heritage? FindHeritage(string publicId) => _context.Heritage
        .AsNoTracking()
        .Include(h => h.Images)
        .Include(h => h.Videos)
        .Include(h => h.Documents)
        .FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);

    public Heritage AddHeritage(Heritage heritage)
    {
        _context.Heritage.Add(heritage);
        _context.SaveChanges();
        return heritage;
    }

    public void UpdateHeritage(Heritage heritage)
    {
        heritage.UpdatedAt = DateTime.UtcNow;
        _context.Heritage.Update(heritage);
        _context.SaveChanges();
    }

    public void DeleteHeritage(string publicId)
    {
        var item = FindHeritage(publicId);
        if (item is null) return;
        item.IsDeleted = true;
        item.DeletedAt = DateTime.UtcNow;
        _context.Heritage.Update(item);
        _context.SaveChanges();
    }

    public HeritageImage AddImage(string publicId, HeritageImage image)
    {
        var heritage = _context.Heritage.FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted)
            ?? throw new InvalidOperationException("Heritage not found.");
        image.HeritageId = heritage.HeritageId;
        if (!heritage.Images.Any())
        {
            heritage.ThumbnailUrl = image.ImageUrl;
            _context.Heritage.Update(heritage);
        }
        _context.HeritageImages.Add(image);
        _context.SaveChanges();
        return image;
    }

    public void DeleteImage(string publicId, long imageId)
    {
        var heritage = _context.Heritage.FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
        if (heritage is null) return;
        var image = _context.HeritageImages.FirstOrDefault(i => i.ImageId == imageId && i.HeritageId == heritage.HeritageId);
        if (image is not null)
        {
            _context.HeritageImages.Remove(image);
            if (heritage.ThumbnailUrl == image.ImageUrl && heritage.Images.Any(i => i.ImageId != imageId))
            {
                heritage.ThumbnailUrl = heritage.Images.First(i => i.ImageId != imageId).ImageUrl;
                _context.Heritage.Update(heritage);
            }
            else if (heritage.Images.Count() <= 1)
            {
                heritage.ThumbnailUrl = null;
                _context.Heritage.Update(heritage);
            }
            _context.SaveChanges();
        }
    }

    public HeritageVideo AddVideo(string publicId, HeritageVideo video)
    {
        var heritage = _context.Heritage.FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted)
            ?? throw new InvalidOperationException("Heritage not found.");
        video.HeritageId = heritage.HeritageId;
        _context.HeritageVideos.Add(video);
        _context.SaveChanges();
        return video;
    }

    public void DeleteVideo(string publicId, long videoId)
    {
        var heritage = _context.Heritage.FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
        if (heritage is null) return;
        var video = _context.HeritageVideos.FirstOrDefault(v => v.VideoId == videoId && v.HeritageId == heritage.HeritageId);
        if (video is not null)
        {
            _context.HeritageVideos.Remove(video);
            _context.SaveChanges();
        }
    }

    public HeritageDocument AddDocument(string publicId, HeritageDocument document)
    {
        var heritage = _context.Heritage.FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted)
            ?? throw new InvalidOperationException("Heritage not found.");
        document.HeritageId = heritage.HeritageId;
        _context.HeritageDocuments.Add(document);
        _context.SaveChanges();
        return document;
    }

    public void DeleteDocument(string publicId, long documentId)
    {
        var heritage = _context.Heritage.FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
        if (heritage is null) return;
        var document = _context.HeritageDocuments.FirstOrDefault(d => d.DocumentId == documentId && d.HeritageId == heritage.HeritageId);
        if (document is not null)
        {
            _context.HeritageDocuments.Remove(document);
            _context.SaveChanges();
        }
    }

    public IntangibleHeritage? FindIntangible(string publicId) => _context.IntangibleHeritages
        .AsNoTracking()
        .FirstOrDefault(x => x.PublicId == publicId && !x.IsDeleted);

    public IntangibleHeritage AddIntangible(IntangibleHeritage item)
    {
        _context.IntangibleHeritages.Add(item);
        _context.SaveChanges();
        return item;
    }

    public void UpdateIntangible(IntangibleHeritage item)
    {
        item.UpdatedAt = DateTime.UtcNow;
        _context.IntangibleHeritages.Update(item);
        _context.SaveChanges();
    }

    public void DeleteIntangible(string publicId)
    {
        var item = FindIntangible(publicId);
        if (item is null) return;
        item.IsDeleted = true;
        item.UpdatedAt = DateTime.UtcNow;
        _context.IntangibleHeritages.Update(item);
        _context.SaveChanges();
    }

    public MonthlyUpdate? FindMonthlyUpdate(int id) => _context.MonthlyUpdates
        .AsNoTracking()
        .FirstOrDefault(x => x.UpdateId == id);

    public MonthlyUpdate AddMonthlyUpdate(MonthlyUpdate item)
    {
        _context.MonthlyUpdates.Add(item);
        _context.SaveChanges();
        return item;
    }

    public void UpdateMonthlyUpdate(MonthlyUpdate item)
    {
        _context.MonthlyUpdates.Update(item);
        _context.SaveChanges();
    }

    public void DeleteMonthlyUpdate(int id)
    {
        var item = _context.MonthlyUpdates.Find(id);
        if (item is not null)
        {
            _context.MonthlyUpdates.Remove(item);
            _context.SaveChanges();
        }
    }

    public ActivityLog AddLog(ActivityLog log)
    {
        _context.ActivityLogs.Add(log);
        _context.SaveChanges();
        return log;
    }

    public void SaveChanges() => _context.SaveChanges();
}
