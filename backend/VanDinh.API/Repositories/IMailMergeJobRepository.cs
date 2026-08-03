using VanDinh.API.DTOs;
using VanDinh.API.Models;

namespace VanDinh.API.Repositories;

public interface IMailMergeJobRepository
{
    MailMergeJob Add(MailMergeJob job);
    MailMergeJob? FindById(long jobId);
    MailMergeJob? FindByPublicId(Guid publicId);
    IReadOnlyList<MailMergeJob> FindActiveOlderThan(DateTime cutoff);
    void Update(MailMergeJob job);
    void Delete(MailMergeJob job);
    PagedResult<MailMergeJob> GetHistory(int page, int pageSize, string? status);
    void SaveChanges();
}
