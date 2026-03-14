using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BoxBox.Api.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BoxBox.Api.Infrastructure.Security;

public class JwtTokenService : ITokenService
{
    private readonly byte[] _keyBytes;
    private const int MinKeyBits = 256;
    private const int ExpirationDays = 30;
    private const string Issuer = "boxbox-api";
    private const string Audience = "boxbox-web";

    public JwtTokenService(IConfiguration configuration)
    {
        var secret = configuration["JWT_SECRET"]
            ?? Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? throw new InvalidOperationException("JWT_SECRET is required");

        _keyBytes = DeriveKey(secret);
    }

    public string GenerateToken(string userId, string username, string playerCode)
    {
        var key = new SymmetricSecurityKey(_keyBytes);
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim("username", username),
            new Claim("playerCode", playerCode),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(ExpirationDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public SymmetricSecurityKey GetSecurityKey()
    {
        return new SymmetricSecurityKey(_keyBytes);
    }

    /// <summary>
    /// Derives a 256-bit key from any secret using HMAC-SHA256.
    /// This ensures the key always meets the minimum size requirement
    /// regardless of the input secret length.
    /// </summary>
    private static byte[] DeriveKey(string secret)
    {
        var secretBytes = Encoding.UTF8.GetBytes(secret);

        if (secretBytes.Length * 8 >= MinKeyBits)
        {
            return secretBytes;
        }

        // Derive a 256-bit key using HMAC-SHA256 with a fixed salt
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes("boxbox-pitwall-tactics-key-derivation"));
        return hmac.ComputeHash(secretBytes);
    }
}
