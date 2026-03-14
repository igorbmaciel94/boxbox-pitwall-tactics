using System.Security.Claims;
using System.Text.Json;
using BoxBox.Api.Api.Dtos;
using BoxBox.Api.Application.Services;
using MongoDB.Bson;

namespace BoxBox.Api.Api.Endpoints;

public static class SyncEndpoints
{
    public static void MapSyncEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/me").WithTags("Sync").RequireAuthorization();

        group.MapGet("/sync", async (ClaimsPrincipal user, SyncApplicationService syncService) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Results.Unauthorized();

            var data = await syncService.GetByUserIdAsync(userId);
            if (data == null)
            {
                return Results.Ok(new SyncPayloadDto());
            }

            var payload = new SyncPayloadDto
            {
                SelectedTeam = data.SelectedTeam,
                Locale = data.Locale,
                SavedDecks = ConvertToJsonElements(data.SavedDecks),
                BestScores = ConvertToJsonElements(data.BestScores),
                RunHistory = ConvertToJsonElements(data.RunHistory),
                SeasonRuns = ConvertToJsonElements(data.SeasonRuns),
                Trophies = ConvertToJsonElements(data.Trophies),
                LastSyncedAt = data.LastSyncedAt,
            };

            return Results.Ok(payload);
        })
        .WithName("GetSyncData")
        .WithOpenApi();

        group.MapPut("/sync", async (ClaimsPrincipal user, SyncPayloadDto payload, SyncApplicationService syncService) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Results.Unauthorized();

            await syncService.UpsertAsync(
                userId,
                payload.SelectedTeam,
                payload.Locale,
                payload.SavedDecks,
                payload.BestScores,
                payload.RunHistory,
                payload.SeasonRuns,
                payload.Trophies);

            return Results.Ok(new { message = "Sync data saved successfully" });
        })
        .WithName("PutSyncData")
        .WithOpenApi();
    }

    private static JsonElement[] ConvertToJsonElements(List<BsonDocument> documents)
    {
        return documents
            .Select(d =>
            {
                var json = d.ToJson(new MongoDB.Bson.IO.JsonWriterSettings
                {
                    OutputMode = MongoDB.Bson.IO.JsonOutputMode.RelaxedExtendedJson
                });
                return JsonSerializer.Deserialize<JsonElement>(json);
            })
            .ToArray();
    }
}
