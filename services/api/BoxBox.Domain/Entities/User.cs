using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BoxBox.Api.Domain.Entities;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string Username { get; set; } = null!;

    public string PlayerCode { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public static string DerivePlayerCode(string username)
    {
        if (string.IsNullOrWhiteSpace(username) || username.Length < 3)
            throw new ArgumentException("Username must be at least 3 characters", nameof(username));

        return username[..3].ToUpperInvariant();
    }
}
