using VanDinh.API.DTOs;
using VanDinh.API.Models;

namespace VanDinh.API.Repositories;

public interface IAppRepository
{
    IReadOnlyList<Role> Roles { get; }
    IReadOnlyList<User> Users { get; }
    IReadOnlyList<HeritageCategory> Categories { get; }
    IReadOnlyList<Heritage> Heritages { get; }
    IReadOnlyList<IntangibleHeritage> IntangibleHeritages { get; }
    IReadOnlyList<ActivityLog> ActivityLogs { get; }
    AboutPage AboutPage { get; }
    IReadOnlyList<AboutPageHistory> AboutPageHistories { get; }
    SystemSetting SystemSetting { get; }

    IQueryable<Heritage> HeritagesUntracked { get; }
    IQueryable<IntangibleHeritage> IntangibleHeritagesUntracked { get; }
    IQueryable<ActivityLog> ActivityLogsUntracked { get; }
    IQueryable<User> UsersUntracked { get; }
    IQueryable<ServiceEvaluation> ServiceEvaluationsUntracked { get; }

    void AddAboutPageHistory(AboutPageHistory history);

    Role? FindRole(string roleName);
    User? FindUser(long userId);
    User? FindUser(string username);
    User AddUser(User user);
    void UpdateUser(User user);
    void DeleteUser(long userId);

    HeritageCategory? FindCategory(int id);
    HeritageCategory? FindCategory(string code);
    HeritageCategory AddCategory(HeritageCategory category);
    void UpdateCategory(HeritageCategory category);
    void DeleteCategory(int id);

    Heritage? FindHeritage(long id);
    Heritage? FindHeritage(string publicId);
    Heritage AddHeritage(Heritage heritage);
    void UpdateHeritage(Heritage heritage);
    void DeleteHeritage(string publicId);

    HeritageImage? FindImageById(long imageId);
    HeritageVideo? FindVideoById(long videoId);
    HeritageDocument? FindDocumentById(long documentId);
    void DeleteImageRecord(HeritageImage image);
    void DeleteVideoRecord(HeritageVideo video);
    void DeleteDocumentRecord(HeritageDocument document);
    Dictionary<string, long> FindAllImageUrls();
    Dictionary<string, long> FindAllVideoUrls();
    Dictionary<string, long> FindAllDocumentUrls();
    HeritageImage AddImage(string publicId, HeritageImage image);
    void DeleteImage(string publicId, long imageId);
    HeritageVideo AddVideo(string publicId, HeritageVideo video);
    void DeleteVideo(string publicId, long videoId);
    HeritageDocument AddDocument(string publicId, HeritageDocument document);
    void DeleteDocument(string publicId, long documentId);

    IntangibleHeritage? FindIntangible(string publicId);
    IntangibleHeritage AddIntangible(IntangibleHeritage item);
    void UpdateIntangible(IntangibleHeritage item);
    void DeleteIntangible(string publicId);

    IReadOnlyList<RelatedLink> RelatedLinks { get; }

    RelatedLink? FindRelatedLink(int id);
    RelatedLink AddRelatedLink(RelatedLink item);
    void UpdateRelatedLink(RelatedLink item);
    void DeleteRelatedLink(int id);
    IQueryable<ContactMessage> ContactMessagesUntracked { get; }

    ContactMessage? FindContactMessage(long id);
    ContactMessage AddContactMessage(ContactMessage item);
    void UpdateContactMessage(ContactMessage item);
    void DeleteContactMessage(long id);

    ServiceEvaluation AddEvaluation(ServiceEvaluation item);
    ServiceEvaluation? FindEvaluation(long id);
    void DeleteEvaluation(long id);

    ActivityLog AddLog(ActivityLog log);
    void SaveChanges();

    // ── Transaction support ─────────────────────────────────────────
    Task ExecuteInTransactionAsync(Func<Task> action);

    // ── Diagnostic methods ──────────────────────────────────────────
    string? GetDatabaseName();
    string? GetDatabaseServer();
    string? GetConnectionStringMasked();
    List<HeritageImage> GetAllImageRecords();

    // ── Media usage tracking ─────────────────────────────────────────
    int CountHeritageReferencesByUrl(string url);

    // ── Media cascade / orphan management ────────────────────────────
    string? RemoveImageFromHeritage(string publicId, long imageId);
    string? RemoveVideoFromHeritage(string publicId, long videoId);
    string? RemoveDocumentFromHeritage(string publicId, long documentId);
    void DeleteAllMediaForHeritage(string publicId);

    // ── MediaFile tracking ───────────────────────────────────────────
    MediaFile AddMediaFile(MediaFile mediaFile);
    MediaFile? FindMediaFileByUrl(string url);
    MediaFile? FindMediaFileById(long mediaFileId);
    void DeleteMediaFile(long mediaFileId);
    void DeleteMediaFileByUrl(string url);

    // ── Media search ─────────────────────────────────────────────────
    PagedResult<MediaItemDto> SearchMedia(MediaSearchRequest request);

    // ── Media counting (single source of truth for dashboard stats) ──
    int CountMediaFilesByType(string mediaType);
}
