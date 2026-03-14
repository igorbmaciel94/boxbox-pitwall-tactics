using BoxBox.Api.Domain.Entities;

namespace BoxBox.Api.Domain.Interfaces;

public interface ISyncDataRepository
{
    Task<SyncData?> GetByUserIdAsync(string userId);
    Task UpsertAsync(SyncData syncData);
}
