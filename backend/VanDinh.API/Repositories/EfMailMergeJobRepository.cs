using Microsoft.EntityFrameworkCore;
using VanDinh.API.Data;
using VanDinh.API.DTOs;
using VanDinh.API.Models;

namespace VanDinh.API.Repositories;

public sealed class EfMailMergeJobRepository(ApplicationDbContext context) : IMailMergeJobRepository
{
    public MailMergeJob Add(MailMergeJob job)
    {
        var entry = context.MailMergeJobs.Add(job);
        return entry.Entity;
    }

    public MailMergeJob? FindById(long jobId)
        => context.MailMergeJobs.AsNoTracking().FirstOrDefault(j => j.JobId == jobId);

    public MailMergeJob? FindByPublicId(Guid publicId)
        => context.MailMergeJobs.AsNoTracking().FirstOrDefault(j => j.PublicId == publicId);

    public IReadOnlyList<MailMergeJob> FindActiveOlderThan(DateTime cutoff)
        => context.MailMergeJobs
            .AsNoTracking()
            .Where(j => j.Status == "Processing" && j.CreatedAt < cutoff)
            .ToList();

    public void Update(MailMergeJob job)
    {
        context.MailMergeJobs.Update(job);
    }

    public void Delete(MailMergeJob job)
    {
        context.MailMergeJobs.Remove(job);
    }

    public PagedResult<MailMergeJob> GetHistory(int page, int pageSize, string? status)
    {
        var query = context.MailMergeJobs.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(j => j.Status == status);
        }
        query = query.OrderByDescending(j => j.CreatedAt);
        return PagedResult<MailMergeJob>.Create(query, page, pageSize);
    }

    public void SaveChanges() => context.SaveChanges();
}
