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
    IReadOnlyList<MonthlyUpdate> MonthlyUpdates { get; }
    AboutPage AboutPage { get; }
    IReadOnlyList<AboutPageHistory> AboutPageHistories { get; }
    SystemSetting SystemSetting { get; }

    IQueryable<Heritage> HeritagesUntracked { get; }
    IQueryable<IntangibleHeritage> IntangibleHeritagesUntracked { get; }
    IQueryable<ActivityLog> ActivityLogsUntracked { get; }
    IQueryable<User> UsersUntracked { get; }

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

    MonthlyUpdate? FindMonthlyUpdate(int id);
    MonthlyUpdate AddMonthlyUpdate(MonthlyUpdate item);
    void UpdateMonthlyUpdate(MonthlyUpdate item);
    void DeleteMonthlyUpdate(int id);

    IReadOnlyList<RelatedLink> RelatedLinks { get; }

    RelatedLink? FindRelatedLink(int id);
    RelatedLink AddRelatedLink(RelatedLink item);
    void UpdateRelatedLink(RelatedLink item);
    void DeleteRelatedLink(int id);

    ActivityLog AddLog(ActivityLog log);
    void SaveChanges();
}
