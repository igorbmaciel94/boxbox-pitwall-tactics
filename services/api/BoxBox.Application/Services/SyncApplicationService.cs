using BoxBox.Api.Domain.Entities;
using BoxBox.Api.Domain.Interfaces;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System.Text.Json;

namespace BoxBox.Api.Application.Services;

public class SyncApplicationService
{
    private readonly ISyncDataRepository _syncDataRepository;

    public SyncApplicationService(ISyncDataRepository syncDataRepository)
    {
        _syncDataRepository = syncDataRepository;
    }

    public async Task<SyncData?> GetByUserIdAsync(string userId)
    {
        return await _syncDataRepository.GetByUserIdAsync(userId);
    }

    public async Task UpsertAsync(string userId, string? selectedTeam, string locale,
        JsonElement[] savedDecks, JsonElement[] bestScores, JsonElement[] runHistory,
        JsonElement[] seasonRuns, JsonElement[] trophies)
    {
        var syncData = new SyncData
        {
            UserId = userId,
            SelectedTeam = selectedTeam,
            Locale = locale,
            SavedDecks = ConvertToBsonList(savedDecks),
            BestScores = ConvertToBsonList(bestScores),
            RunHistory = ConvertToBsonList(runHistory),
            SeasonRuns = ConvertToBsonList(seasonRuns),
            Trophies = ConvertToBsonList(trophies),
            LastSyncedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        };

        await _syncDataRepository.UpsertAsync(syncData);
    }

    private static List<BsonDocument> ConvertToBsonList(JsonElement[] elements)
    {
        return elements
            .Select(e => BsonSerializer.Deserialize<BsonDocument>(e.GetRawText()))
            .ToList();
    }
}
