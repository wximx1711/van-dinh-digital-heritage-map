using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VanDinh.API.Data;
using VanDinh.API.DTOs;
using VanDinh.API.Models;
using VanDinh.API.Repositories;

namespace VanDinh.API.Services;

public sealed class EfAppRepository : IAppRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EfAppRepository> _logger;

    public EfAppRepository(ApplicationDbContext context, ILogger<EfAppRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

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
            .ThenInclude(u => u.Role)
        .OrderByDescending(l => l.CreatedAt)
        .ToList();

    public IQueryable<Heritage> HeritagesUntracked => _context.Heritage
        .AsNoTracking()
        .Include(h => h.Images)
        .Include(h => h.Videos)
        .Include(h => h.Documents)
        .Where(h => !h.IsDeleted);

    public IQueryable<IntangibleHeritage> IntangibleHeritagesUntracked => _context.IntangibleHeritages
        .AsNoTracking()
        .Where(i => !i.IsDeleted);

    public IQueryable<ActivityLog> ActivityLogsUntracked => _context.ActivityLogs
        .AsNoTracking()
        .Include(l => l.User)
            .ThenInclude(u => u.Role);

    public IQueryable<User> UsersUntracked => _context.Users
        .AsNoTracking()
        .Include(u => u.Role);

    public AboutPage AboutPage
    {
        get
        {
            var existing = _context.AboutPages.Local.FirstOrDefault();
            if (existing is not null) return existing;
            var fromDb = _context.AboutPages.FirstOrDefault();
            if (fromDb is not null) return fromDb;
            var newEntity = new AboutPage();
            _context.AboutPages.Add(newEntity);
            return newEntity;
        }
    }

    public IReadOnlyList<AboutPageHistory> AboutPageHistories => _context.AboutPageHistories
        .AsNoTracking()
        .OrderByDescending(h => h.HistoryId)
        .ToList();

    public void AddAboutPageHistory(AboutPageHistory history)
    {
        _context.AboutPageHistories.Add(history);
        _context.SaveChanges();
    }

    public SystemSetting SystemSetting
    {
        get
        {
            var existing = _context.SystemSettings.Local.FirstOrDefault();
            if (existing is not null) return existing;
            var fromDb = _context.SystemSettings.FirstOrDefault();
            if (fromDb is not null) return fromDb;
            var newEntity = new SystemSetting();
            _context.SystemSettings.Add(newEntity);
            return newEntity;
        }
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
        var existing = _context.Users.Find(user.UserId);
        if (existing is null) return;
        _context.Entry(existing).CurrentValues.SetValues(user);
        existing.UpdatedAt = DateTime.UtcNow;
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
        var existing = _context.HeritageCategories.Find(category.CategoryId);
        if (existing is null) return;
        _context.Entry(existing).CurrentValues.SetValues(category);
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
        _logger.LogInformation("AddHeritage: Adding Heritage entity (PublicId={PublicId}) to context...", heritage.PublicId);
        _context.Heritage.Add(heritage);
        _logger.LogInformation("AddHeritage: Calling SaveChanges()...");
        try
        {
            _context.SaveChanges();
            _logger.LogInformation("AddHeritage: SaveChanges() succeeded. HeritageId={HeritageId} assigned.", heritage.HeritageId);
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "AddHeritage: SaveChanges() FAILED for Heritage (PublicId={PublicId})", heritage.PublicId);
            MappingExtensions.LogMaterializationError(_logger, ex, "EfAppRepository.AddHeritage.SaveChanges");
            throw;
        }

        // TEMPORARY DIAGNOSTIC: Inspect every property after loading
        try
        {
            var reloaded = _context.Heritage
                .AsNoTracking()
                .Include(h => h.Images)
                .Include(h => h.Videos)
                .Include(h => h.Documents)
                .FirstOrDefault(h => h.PublicId == heritage.PublicId);
            if (reloaded is not null)
            {
                _logger.LogInformation("AddHeritage: Successfully reloaded Heritage {PublicId} from DB. Inspecting properties...", heritage.PublicId);
                MappingExtensions.DiagnoseHeritage(reloaded, _logger, "AddHeritage-Reload");
            }
            else
            {
                _logger.LogWarning("AddHeritage: Could not reload Heritage {PublicId} from DB after SaveChanges.", heritage.PublicId);
            }
        }
        catch (Exception reloadEx)
        {
            _logger.LogCritical(reloadEx, "AddHeritage: FAILED to reload Heritage {PublicId} from DB after SaveChanges! This indicates a materialization issue.", heritage.PublicId);
            MappingExtensions.LogMaterializationError(_logger, reloadEx, "EfAppRepository.AddHeritage.Reload");
            throw;
        }

        return heritage;
    }

    public void UpdateHeritage(Heritage heritage)
    {
        var existing = _context.Heritage
            .FirstOrDefault(h => h.HeritageId == heritage.HeritageId);
        if (existing is null) return;
        _context.Entry(existing).CurrentValues.SetValues(heritage);
        existing.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
    }

    public void DeleteHeritage(string publicId)
    {
        var item = _context.Heritage
            .FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
        if (item is null) return;
        item.IsDeleted = true;
        item.DeletedAt = DateTime.UtcNow;
        _context.SaveChanges();
    }

    public HeritageImage AddImage(string publicId, HeritageImage image)
    {
        _logger.LogInformation("AddImage: Loading Heritage {PublicId} with Images navigation (materialization point)...", publicId);
        Heritage heritage;
        try
        {
            heritage = _context.Heritage
                .Include(h => h.Images)
                .FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted)
                ?? throw new InvalidOperationException("Heritage not found.");
            _logger.LogInformation("AddImage: Heritage {PublicId} loaded successfully (HeritageId={HeritageId}, Images.Count={ImgCount})",
                publicId, heritage.HeritageId, heritage.Images.Count);

            // TEMPORARY DIAGNOSTIC: Inspect loaded Heritage entity
            MappingExtensions.DiagnoseHeritage(heritage, _logger, "AddImage-Load");
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "AddImage: FAILED to load Heritage {PublicId} from DB!", publicId);
            MappingExtensions.LogMaterializationError(_logger, ex, "EfAppRepository.AddImage.LoadHeritage");
            throw;
        }

        image.HeritageId = heritage.HeritageId;
        if (!heritage.Images.Any())
        {
            heritage.ThumbnailUrl = image.ImageUrl;
            _context.Heritage.Update(heritage);
        }
        _logger.LogInformation("AddImage: Adding HeritageImage (ImageUrl={ImageUrl}, SortOrder={SortOrder}) to context...", image.ImageUrl, image.SortOrder);
        _context.HeritageImages.Add(image);
        try
        {
            _context.SaveChanges();
            _logger.LogInformation("AddImage: SaveChanges() succeeded. ImageId={ImageId} assigned.", image.ImageId);
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "AddImage: SaveChanges() FAILED for HeritageImage (PublicId={PublicId})", publicId);
            MappingExtensions.LogMaterializationError(_logger, ex, "EfAppRepository.AddImage.SaveChanges");
            throw;
        }

        // TEMPORARY DIAGNOSTIC: Reload and inspect the HeritageImage
        try
        {
            var reloadedImage = _context.HeritageImages.AsNoTracking().FirstOrDefault(i => i.ImageId == image.ImageId);
            if (reloadedImage is not null)
            {
                MappingExtensions.DiagnoseHeritageImage(reloadedImage, _logger, "AddImage-Reload");
            }
        }
        catch (Exception diagEx)
        {
            _logger.LogWarning(diagEx, "AddImage: Diagnostic reload failed for ImageId={ImageId} (non-critical)", image.ImageId);
        }

        return image;
    }

    public HeritageImage? FindImageById(long imageId)
    {
        _logger.LogInformation("FindImageById: Querying table HeritageImages with PK ImageId={ImageId}", imageId);

        // ════════════════════════════════════════════════════════════════
        // STEP 1 — Raw SQL diagnostic (bypasses EF change tracker)
        // ════════════════════════════════════════════════════════════════
        HeritageImage? sqlResult = null;
        try
        {
            sqlResult = _context.HeritageImages
                .FromSqlRaw("SELECT * FROM HeritageImages WHERE ImageId = {0}", imageId)
                .AsNoTracking()
                .FirstOrDefault();

            if (sqlResult is not null)
            {
                _logger.LogInformation(
                    "[STEP 1] SELECT * FROM HeritageImages WHERE ImageId = @imageId — {RowCount} row(s) returned:" +
                    " ImageId={ImageId}, HeritageId={HeritageId}, ImageUrl={ImageUrl}",
                    1, sqlResult.ImageId, sqlResult.HeritageId, sqlResult.ImageUrl);
            }
            else
            {
                _logger.LogWarning("[STEP 1] SELECT * FROM HeritageImages WHERE ImageId = @imageId — 0 rows returned for ImageId={ImageId}", imageId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[STEP 1] Raw SQL query FAILED for ImageId={ImageId}", imageId);
        }

        // ════════════════════════════════════════════════════════════════
        // Original EF Find — the method the application actually uses
        // ════════════════════════════════════════════════════════════════
        var result = _context.HeritageImages.Find(imageId);

        if (result is null)
        {
            _logger.LogWarning("FindImageById: NO record found in HeritageImages for ImageId={ImageId}", imageId);

            // ════════════════════════════════════════════════════════════
            // STEP 5 — If raw SQL found a row but EF Find() returned null
            // ════════════════════════════════════════════════════════════
            if (sqlResult is not null)
            {
                _logger.LogWarning(
                    "[STEP 5] MISMATCH — RAW SQL returned a row but EF Find() returned null for ImageId={ImageId}!" +
                    " Trying FirstOrDefault alternatives...", imageId);

                // Attempt 1: FirstOrDefault (tracked)
                var attempt1 = _context.HeritageImages
                    .FirstOrDefault(x => x.ImageId == imageId);
                _logger.LogInformation(
                    "[STEP 5] FirstOrDefault(x => x.ImageId == imageId): {Result}",
                    attempt1 is null ? "NULL" : $"FOUND — ImageId={attempt1.ImageId}, ImageUrl={attempt1.ImageUrl}, HeritageId={attempt1.HeritageId}");

                // Attempt 2: FirstOrDefault + AsNoTracking (bypasses tracker entirely)
                var attempt2 = _context.HeritageImages
                    .AsNoTracking()
                    .FirstOrDefault(x => x.ImageId == imageId);
                _logger.LogInformation(
                    "[STEP 5] FirstOrDefault + AsNoTracking(x => x.ImageId == imageId): {Result}",
                    attempt2 is null ? "NULL" : $"FOUND — ImageId={attempt2.ImageId}, ImageUrl={attempt2.ImageUrl}, HeritageId={attempt2.HeritageId}");

                if (attempt1 is not null)
                {
                    _logger.LogWarning("[STEP 5] CONCLUSION: Find() fails but FirstOrDefault() works. The EF change tracker holds a stale entry. Call _context.Entry(stale).State = EntityState.Detached before Find().");
                }
                else if (attempt2 is not null)
                {
                    _logger.LogWarning("[STEP 5] CONCLUSION: Only AsNoTracking() works. The entity is likely tracked with wrong key or in a state that blocks Find().");
                }
                else
                {
                    _logger.LogWarning("[STEP 5] CONCLUSION: All EF Core methods returned null despite SQL Server having the row. Possible connection string mismatch or database context targeting wrong database.");
                }
            }
        }
        else
        {
            _logger.LogInformation("FindImageById: FOUND record ImageId={ImageId}, ImageUrl={ImageUrl}, HeritageId={HeritageId}",
                result.ImageId, result.ImageUrl, result.HeritageId);
        }

        return result;
    }

    public HeritageVideo? FindVideoById(long videoId)
    {
        return _context.HeritageVideos.Find(videoId);
    }

    public HeritageDocument? FindDocumentById(long documentId)
    {
        return _context.HeritageDocuments.Find(documentId);
    }

    public void DeleteImageRecord(HeritageImage image)
    {
        _context.HeritageImages.Remove(image);
        _context.SaveChanges();
    }

    public void DeleteVideoRecord(HeritageVideo video)
    {
        _context.HeritageVideos.Remove(video);
        _context.SaveChanges();
    }

    public void DeleteDocumentRecord(HeritageDocument document)
    {
        _context.HeritageDocuments.Remove(document);
        _context.SaveChanges();
    }

    public Dictionary<string, long> FindAllImageUrls()
    {
        var records = _context.MediaFiles
            .AsNoTracking()
            .Where(mf => mf.MediaType == "image")
            .ToList();
        _logger.LogInformation("FindAllImageUrls: Loaded {Count} records from table MediaFiles (MediaType=image)", records.Count);
        return records
            .GroupBy(mf => mf.Url)
            .ToDictionary(g => g.Key, g => g.First().MediaFileId);
    }

    public Dictionary<string, long> FindAllVideoUrls()
    {
        return _context.MediaFiles
            .AsNoTracking()
            .Where(mf => mf.MediaType == "video")
            .ToList()
            .GroupBy(mf => mf.Url)
            .ToDictionary(g => g.Key, g => g.First().MediaFileId);
    }

    public Dictionary<string, long> FindAllDocumentUrls()
    {
        return _context.MediaFiles
            .AsNoTracking()
            .Where(mf => mf.MediaType == "document")
            .ToList()
            .GroupBy(mf => mf.Url)
            .ToDictionary(g => g.Key, g => g.First().MediaFileId);
    }

    public void DeleteImage(string publicId, long imageId)
    {
        var heritage = _context.Heritage
            .Include(h => h.Images)
            .FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
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
        if (string.IsNullOrWhiteSpace(item.PublicId))
        {
            var existingIds = _context.IntangibleHeritages
                .Where(i => i.PublicId.StartsWith("ih"))
                .Select(i => i.PublicId)
                .ToList();
            var num = 1;
            while (existingIds.Contains($"ih{num:D4}")) { num++; }
            item.PublicId = $"ih{num:D4}";
        }

        item.CreatedAt = DateTime.UtcNow;

        _context.IntangibleHeritages.Add(item);
        _context.SaveChanges();
        return item;
    }

    public void UpdateIntangible(IntangibleHeritage item)
    {
        var existing = _context.IntangibleHeritages.Find(item.IntangibleId);
        if (existing is null) return;
        _context.Entry(existing).CurrentValues.SetValues(item);
        existing.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
    }

    public void DeleteIntangible(string publicId)
    {
        var item = _context.IntangibleHeritages
            .FirstOrDefault(i => i.PublicId == publicId && !i.IsDeleted);
        if (item is null) return;
        item.IsDeleted = true;
        item.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
    }

    public IReadOnlyList<RelatedLink> RelatedLinks => _context.RelatedLinks
        .AsNoTracking()
        .OrderBy(x => x.DisplayOrder)
        .ToList();

    public RelatedLink? FindRelatedLink(int id) => _context.RelatedLinks
        .AsNoTracking()
        .FirstOrDefault(x => x.LinkId == id);

    public RelatedLink AddRelatedLink(RelatedLink item)
    {
        _context.RelatedLinks.Add(item);
        _context.SaveChanges();
        return item;
    }

    public void UpdateRelatedLink(RelatedLink item)
    {
        var existing = _context.RelatedLinks.Find(item.LinkId);
        if (existing is null) return;
        _context.Entry(existing).CurrentValues.SetValues(item);
        existing.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
    }

    public void DeleteRelatedLink(int id)
    {
        var item = _context.RelatedLinks.Find(id);
        if (item is not null)
        {
            _context.RelatedLinks.Remove(item);
            _context.SaveChanges();
        }
    }

    public IQueryable<ContactMessage> ContactMessagesUntracked => _context.ContactMessages
        .AsNoTracking()
        .OrderByDescending(x => x.CreatedAt);

    public ContactMessage? FindContactMessage(long id) => _context.ContactMessages
        .AsNoTracking()
        .FirstOrDefault(x => x.Id == id);

    public ContactMessage AddContactMessage(ContactMessage item)
    {
        _context.ContactMessages.Add(item);
        _context.SaveChanges();
        return item;
    }

    public void UpdateContactMessage(ContactMessage item)
    {
        var existing = _context.ContactMessages.Find(item.Id);
        if (existing is null) return;
        _context.Entry(existing).CurrentValues.SetValues(item);
        _context.SaveChanges();
    }

    public void DeleteContactMessage(long id)
    {
        var item = _context.ContactMessages.Find(id);
        if (item is not null)
        {
            _context.ContactMessages.Remove(item);
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

    public async Task ExecuteInTransactionAsync(Func<Task> action)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await action();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    // ── Diagnostic methods ──────────────────────────────────────────

    public string? GetDatabaseName()
    {
        try
        {
            return _context.Database.SqlQueryRaw<string>("SELECT DB_NAME()").FirstOrDefault();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetDatabaseName failed");
            return null;
        }
    }

    public string? GetDatabaseServer()
    {
        try
        {
            return _context.Database.SqlQueryRaw<string>("SELECT @@SERVERNAME").FirstOrDefault();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetDatabaseServer failed");
            return null;
        }
    }

    public string? GetConnectionStringMasked()
    {
        try
        {
            var cs = _context.Database.GetConnectionString();
            if (string.IsNullOrEmpty(cs)) return null;
            return System.Text.RegularExpressions.Regex.Replace(cs, "(Password|Pwd)=([^;]+)", "$1=*****", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetConnectionStringMasked failed");
            return null;
        }
    }

    public List<HeritageImage> GetAllImageRecords()
    {
        return _context.HeritageImages.AsNoTracking().ToList();
    }

    public int CountHeritageReferencesByUrl(string url)
    {
        return _context.Heritage
            .AsNoTracking()
            .Count(h => !h.IsDeleted && (
                h.ThumbnailUrl == url ||
                h.Images.Any(i => i.ImageUrl == url) ||
                h.Videos.Any(v => v.VideoUrl == url) ||
                h.Documents.Any(d => d.FileUrl == url)
            ));
    }

    public string? RemoveImageFromHeritage(string publicId, long imageId)
    {
        var heritage = _context.Heritage
            .Include(h => h.Images)
            .FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
        if (heritage is null) return null;

        var image = heritage.Images.FirstOrDefault(i => i.ImageId == imageId);
        if (image is null) return null;

        var url = image.ImageUrl;
        _context.HeritageImages.Remove(image);

        // Update thumbnail if the removed image was the thumbnail
        if (heritage.ThumbnailUrl == url)
        {
            var nextImage = heritage.Images
                .Where(i => i.ImageId != imageId)
                .MinBy(i => i.SortOrder);
            heritage.ThumbnailUrl = nextImage?.ImageUrl;
            _context.Heritage.Update(heritage);
        }

        _context.SaveChanges();
        return url;
    }

    public string? RemoveVideoFromHeritage(string publicId, long videoId)
    {
        var heritage = _context.Heritage
            .Include(h => h.Videos)
            .FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
        if (heritage is null) return null;

        var video = heritage.Videos.FirstOrDefault(v => v.VideoId == videoId);
        if (video is null) return null;

        var url = video.VideoUrl;
        _context.HeritageVideos.Remove(video);
        _context.SaveChanges();
        return url;
    }

    public string? RemoveDocumentFromHeritage(string publicId, long documentId)
    {
        var heritage = _context.Heritage
            .Include(h => h.Documents)
            .FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
        if (heritage is null) return null;

        var document = heritage.Documents.FirstOrDefault(d => d.DocumentId == documentId);
        if (document is null) return null;

        var url = document.FileUrl;
        _context.HeritageDocuments.Remove(document);
        _context.SaveChanges();
        return url;
    }

    public void DeleteAllMediaForHeritage(string publicId)
    {
        var heritage = _context.Heritage
            .Include(h => h.Images)
            .Include(h => h.Videos)
            .Include(h => h.Documents)
            .FirstOrDefault(h => h.PublicId == publicId && !h.IsDeleted);
        if (heritage is null) return;

        _context.HeritageImages.RemoveRange(heritage.Images);
        _context.HeritageVideos.RemoveRange(heritage.Videos);
        _context.HeritageDocuments.RemoveRange(heritage.Documents);
        heritage.ThumbnailUrl = null;
        _context.SaveChanges();
    }

    // ── MediaFile tracking ──────────────────────────────────────────

    public MediaFile AddMediaFile(MediaFile mediaFile)
    {
        _context.MediaFiles.Add(mediaFile);
        _context.SaveChanges();
        return mediaFile;
    }

    public MediaFile? FindMediaFileByUrl(string url)
    {
        return _context.MediaFiles.AsNoTracking().FirstOrDefault(mf => mf.Url == url);
    }

    public MediaFile? FindMediaFileById(long mediaFileId)
    {
        return _context.MediaFiles.AsNoTracking().FirstOrDefault(mf => mf.MediaFileId == mediaFileId);
    }

    public void DeleteMediaFile(long mediaFileId)
    {
        var mf = _context.MediaFiles.Find(mediaFileId);
        if (mf is not null)
        {
            _context.MediaFiles.Remove(mf);
            _context.SaveChanges();
        }
    }

    public void DeleteMediaFileByUrl(string url)
    {
        var mf = _context.MediaFiles.FirstOrDefault(m => m.Url == url);
        if (mf is not null)
        {
            _context.MediaFiles.Remove(mf);
            _context.SaveChanges();
        }
    }

    // ── Media counting (single source of truth for dashboard stats) ──
    // Counts directly from the MediaFiles table so that AdminDashboard
    // and MediaManagement always see the same numbers. Previously the
    // StatisticsController summed Heritage.Images/Videos/Documents which
    // only counted media linked to heritage sites, missing orphaned files
    // and diverging from the Media Library view.
    public int CountMediaFilesByType(string mediaType)
    {
        return _context.MediaFiles.Count(mf => mf.MediaType == mediaType);
    }

    // ── Media search ────────────────────────────────────────────────

    public PagedResult<MediaItemDto> SearchMedia(MediaSearchRequest request)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        // Step 1: Base query from MediaFiles
        var baseQuery = _context.MediaFiles.AsNoTracking();

        // Apply type filter
        if (!string.IsNullOrEmpty(request.MediaType))
            baseQuery = baseQuery.Where(mf => mf.MediaType == request.MediaType);

        // Apply search filter
        if (!string.IsNullOrEmpty(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            baseQuery = baseQuery.Where(mf =>
                mf.FileName.ToLower().Contains(search) ||
                mf.Url.ToLower().Contains(search));
        }

        // Step 2: Get all matching IDs (lightweight, just IDs and URLs for heritage lookup)
        var allMatchingIds = baseQuery.Select(mf => mf.MediaFileId).ToList();
        var totalBeforeUsage = allMatchingIds.Count;

        // Step 3: If no results, return early
        if (totalBeforeUsage == 0)
            return new PagedResult<MediaItemDto>(Array.Empty<MediaItemDto>(), page, pageSize, 0, 0);

        // Step 4: Load full items for matching IDs
        var allItems = _context.MediaFiles.AsNoTracking()
            .Where(mf => allMatchingIds.Contains(mf.MediaFileId))
            .ToList();

        // Step 5: Batch compute heritage references for all matching URLs
        var urls = allItems.Select(mf => mf.Url).Distinct().ToList();
        var heritageRefs = BatchGetHeritageReferences(urls);

        // Step 6: Apply usage filter
        List<long> filteredIds;
        if (request.UsageFilter == "used")
        {
            filteredIds = allItems
                .Where(mf => heritageRefs.TryGetValue(mf.Url, out var info) && info.Count > 0)
                .Select(mf => mf.MediaFileId)
                .ToList();
        }
        else if (request.UsageFilter == "unused")
        {
            filteredIds = allItems
                .Where(mf => !heritageRefs.ContainsKey(mf.Url) || heritageRefs[mf.Url].Count == 0)
                .Select(mf => mf.MediaFileId)
                .ToList();
        }
        else
        {
            filteredIds = allMatchingIds.ToList();
        }

        var totalCount = filteredIds.Count;

        // Step 7: Apply sorting
        IEnumerable<long> sortedIds = (request.SortBy, request.SortDirection) switch
        {
            ("fileName", "asc") => allItems
                .Where(mf => filteredIds.Contains(mf.MediaFileId))
                .OrderBy(mf => mf.FileName)
                .ThenBy(mf => mf.MediaFileId)
                .Select(mf => mf.MediaFileId),

            ("fileName", "desc") => allItems
                .Where(mf => filteredIds.Contains(mf.MediaFileId))
                .OrderByDescending(mf => mf.FileName)
                .ThenBy(mf => mf.MediaFileId)
                .Select(mf => mf.MediaFileId),

            ("uploadedAt", "asc") => allItems
                .Where(mf => filteredIds.Contains(mf.MediaFileId))
                .OrderBy(mf => mf.UploadedAt)
                .ThenBy(mf => mf.MediaFileId)
                .Select(mf => mf.MediaFileId),

            _ => allItems
                .Where(mf => filteredIds.Contains(mf.MediaFileId))
                .OrderByDescending(mf => mf.UploadedAt)
                .ThenBy(mf => mf.MediaFileId)
                .Select(mf => mf.MediaFileId),
        };

        var orderedIds = sortedIds.ToList();

        // Step 8: Paginate
        var pageIds = orderedIds
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToHashSet();

        // Step 9: Get full items for current page in correct order
        var pageItems = orderedIds
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(id => allItems.First(mf => mf.MediaFileId == id))
            .ToList();

        // Step 10: Map to DTOs
        var dtos = pageItems.Select(item =>
        {
            heritageRefs.TryGetValue(item.Url, out var info);
            return new MediaItemDto(
                Id: item.MediaFileId,
                Url: item.Url,
                FileName: item.FileName,
                FileSize: item.FileSize,
                MediaType: item.MediaType,
                UploadedAt: item.UploadedAt,
                UsageCount: info.Count,
                HeritageNames: info.Names ?? Array.Empty<string>()
            );
        }).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<MediaItemDto>(dtos, page, pageSize, totalCount, totalPages);
    }

    private Dictionary<string, (int Count, string[] Names)> BatchGetHeritageReferences(List<string> urls)
    {
        var result = new Dictionary<string, (int, string[])>();

        if (urls.Count == 0) return result;

        foreach (var batch in urls.Chunk(500))
        {
            var batchList = batch.ToList();

            // Query all heritage references in a single union-style query
            var imageRefs = _context.HeritageImages
                .Where(hi => batchList.Contains(hi.ImageUrl))
                .Select(hi => new { hi.ImageUrl, hi.HeritageId });

            var videoRefs = _context.HeritageVideos
                .Where(hv => hv.VideoUrl != null && batchList.Contains(hv.VideoUrl))
                .Select(hv => new { ImageUrl = hv.VideoUrl!, hv.HeritageId });

            var docRefs = _context.HeritageDocuments
                .Where(hd => hd.FileUrl != null && batchList.Contains(hd.FileUrl))
                .Select(hd => new { ImageUrl = hd.FileUrl!, hd.HeritageId });

            var allRefs = imageRefs
                .Concat(videoRefs)
                .Concat(docRefs)
                .Join(_context.Heritage.Where(h => !h.IsDeleted),
                    r => r.HeritageId, h => h.HeritageId,
                    (r, h) => new { r.ImageUrl, h.NameVi })
                .ToList();

            // Group by URL and collect heritage names
            var grouped = allRefs
                .GroupBy(r => r.ImageUrl)
                .ToDictionary(
                    g => g.Key,
                    g => (
                        Count: g.Select(r => r.NameVi).Distinct().Count(),
                        Names: g.Select(r => r.NameVi).Distinct().ToArray()
                    ));

            foreach (var kvp in grouped)
            {
                result[kvp.Key] = kvp.Value;
            }
        }

        return result;
    }
}
