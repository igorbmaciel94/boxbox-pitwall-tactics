using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BoxBox.Api.Infrastructure.Security;
using FluentAssertions;
using Microsoft.Extensions.Configuration;

namespace BoxBox.Api.Tests.Infrastructure;

public class JwtTokenServiceTests
{
    private static JwtTokenService CreateService(string secret = "this-is-a-long-enough-secret-key-for-testing-256-bits!")
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "JWT_SECRET", secret }
            })
            .Build();

        return new JwtTokenService(config);
    }

    [Fact]
    public void GenerateToken_ReturnsValidJwt()
    {
        var sut = CreateService();

        var token = sut.GenerateToken("user123", "igor", "IGO");

        token.Should().NotBeNullOrEmpty();
        var handler = new JwtSecurityTokenHandler();
        handler.CanReadToken(token).Should().BeTrue();
    }

    [Fact]
    public void GenerateToken_ContainsExpectedClaims()
    {
        var sut = CreateService();

        var token = sut.GenerateToken("user123", "igor", "IGO");

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "user123");
        jwt.Claims.Should().Contain(c => c.Type == "username" && c.Value == "igor");
        jwt.Claims.Should().Contain(c => c.Type == "playerCode" && c.Value == "IGO");
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Jti);
    }

    [Fact]
    public void GenerateToken_ExpiresIn30Days()
    {
        var sut = CreateService();

        var token = sut.GenerateToken("user123", "igor", "IGO");

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        var expectedExpiry = DateTime.UtcNow.AddDays(30);
        jwt.ValidTo.Should().BeCloseTo(expectedExpiry, precision: TimeSpan.FromMinutes(1));
    }

    [Fact]
    public void GenerateToken_HasCorrectIssuerAndAudience()
    {
        var sut = CreateService();

        var token = sut.GenerateToken("user123", "igor", "IGO");

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Issuer.Should().Be("boxbox-api");
        jwt.Audiences.Should().Contain("boxbox-web");
    }

    [Fact]
    public void GenerateToken_ShortSecret_StillWorks()
    {
        // Short secrets are key-derived to meet 256-bit minimum
        var sut = CreateService("short-key");

        var token = sut.GenerateToken("user123", "igor", "IGO");

        token.Should().NotBeNullOrEmpty();
        var handler = new JwtSecurityTokenHandler();
        handler.CanReadToken(token).Should().BeTrue();
    }

    [Fact]
    public void GenerateToken_EachCallProducesUniqueJti()
    {
        var sut = CreateService();

        var token1 = sut.GenerateToken("user123", "igor", "IGO");
        var token2 = sut.GenerateToken("user123", "igor", "IGO");

        var handler = new JwtSecurityTokenHandler();
        var jti1 = handler.ReadJwtToken(token1).Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value;
        var jti2 = handler.ReadJwtToken(token2).Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value;

        jti1.Should().NotBe(jti2);
    }

    [Fact]
    public void Constructor_NoSecret_ThrowsInvalidOperation()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        // Clear env var to ensure it's not picked up
        var originalEnv = Environment.GetEnvironmentVariable("JWT_SECRET");
        Environment.SetEnvironmentVariable("JWT_SECRET", null);

        try
        {
            var act = () => new JwtTokenService(config);
            act.Should().Throw<InvalidOperationException>().WithMessage("*JWT_SECRET*");
        }
        finally
        {
            Environment.SetEnvironmentVariable("JWT_SECRET", originalEnv);
        }
    }

    [Fact]
    public void GetSecurityKey_ReturnsNonNullKey()
    {
        var sut = CreateService();

        var key = sut.GetSecurityKey();

        key.Should().NotBeNull();
        key.KeySize.Should().BeGreaterOrEqualTo(256);
    }
}
