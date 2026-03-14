using System.Text.Json;

namespace BoxBox.Api.Api.Dtos;

public class SyncPayloadDto
{
    public string? SelectedTeam { get; set; }
    public string Locale { get; set; } = "en";
    public JsonElement[] SavedDecks { get; set; } = [];
    public JsonElement[] BestScores { get; set; } = [];
    public JsonElement[] RunHistory { get; set; } = [];
    public JsonElement[] SeasonRuns { get; set; } = [];
    public JsonElement[] Trophies { get; set; } = [];
    public long LastSyncedAt { get; set; }
}
