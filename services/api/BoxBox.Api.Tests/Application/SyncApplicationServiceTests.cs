using BoxBox.Api.Application.Services;
using BoxBox.Api.Domain.Entities;
using BoxBox.Api.Domain.Interfaces;
using FluentAssertions;
using MongoDB.Bson;
using Moq;
using System.Text.Json;

namespace BoxBox.Api.Tests.Application;

public class SyncApplicationServiceTests
{
    private readonly Mock<ISyncDataRepository> _syncRepo;
    private readonly SyncApplicationService _sut;

    public SyncApplicationServiceTests()
    {
        _syncRepo = new Mock<ISyncDataRepository>();
        _sut = new SyncApplicationService(_syncRepo.Object);
    }

    [Fact]
    public async Task GetByUserIdAsync_ExistingData_ReturnsSyncData()
    {
        var syncData = new SyncData { UserId = "user1", Locale = "pt-br", SelectedTeam = "red-bull" };
        _syncRepo.Setup(r => r.GetByUserIdAsync("user1")).ReturnsAsync(syncData);

        var result = await _sut.GetByUserIdAsync("user1");

        result.Should().NotBeNull();
        result!.Locale.Should().Be("pt-br");
        result.SelectedTeam.Should().Be("red-bull");
    }

    [Fact]
    public async Task GetByUserIdAsync_NoData_ReturnsNull()
    {
        _syncRepo.Setup(r => r.GetByUserIdAsync("user1")).ReturnsAsync((SyncData?)null);

        var result = await _sut.GetByUserIdAsync("user1");

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpsertAsync_ValidData_CallsRepository()
    {
        var deck = JsonSerializer.Deserialize<JsonElement>("{\"id\": \"deck1\", \"name\": \"My Deck\"}");

        await _sut.UpsertAsync("user1", "ferrari", "en",
            [deck], [], [], [], []);

        _syncRepo.Verify(r => r.UpsertAsync(It.Is<SyncData>(s =>
            s.UserId == "user1" &&
            s.SelectedTeam == "ferrari" &&
            s.Locale == "en" &&
            s.SavedDecks.Count == 1 &&
            s.LastSyncedAt > 0
        )), Times.Once);
    }

    [Fact]
    public async Task UpsertAsync_EmptyArrays_Works()
    {
        await _sut.UpsertAsync("user1", null, "en", [], [], [], [], []);

        _syncRepo.Verify(r => r.UpsertAsync(It.Is<SyncData>(s =>
            s.SavedDecks.Count == 0 &&
            s.BestScores.Count == 0 &&
            s.SelectedTeam == null
        )), Times.Once);
    }
}
