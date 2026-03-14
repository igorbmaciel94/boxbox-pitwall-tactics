using BoxBox.Api.Domain.Entities;
using BoxBox.Api.Domain.Interfaces;
using MongoDB.Driver;

namespace BoxBox.Api.Infrastructure.Persistence;

public class SyncDataRepository : ISyncDataRepository
{
    private readonly IMongoCollection<SyncData> _syncData;

    public SyncDataRepository(IMongoDatabase database)
    {
        _syncData = database.GetCollection<SyncData>("sync_data");
    }

    public async Task<SyncData?> GetByUserIdAsync(string userId)
    {
        return await _syncData.Find(s => s.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task UpsertAsync(SyncData syncData)
    {
        var filter = Builders<SyncData>.Filter.Eq(s => s.UserId, syncData.UserId);
        var options = new ReplaceOptions { IsUpsert = true };
        await _syncData.ReplaceOneAsync(filter, syncData, options);
    }
}
