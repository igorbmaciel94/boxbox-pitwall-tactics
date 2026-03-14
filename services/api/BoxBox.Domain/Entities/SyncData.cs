using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BoxBox.Api.Domain.Entities;

public class SyncData
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string? SelectedTeam { get; set; }

    public string Locale { get; set; } = "en";

    public List<BsonDocument> SavedDecks { get; set; } = [];

    public List<BsonDocument> BestScores { get; set; } = [];

    public List<BsonDocument> RunHistory { get; set; } = [];

    public List<BsonDocument> SeasonRuns { get; set; } = [];

    public List<BsonDocument> Trophies { get; set; } = [];

    public long LastSyncedAt { get; set; }
}
