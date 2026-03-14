using BoxBox.Api.Infrastructure.Security;
using FluentAssertions;

namespace BoxBox.Api.Tests.Infrastructure;

public class BcryptPasswordHasherTests
{
    private readonly BcryptPasswordHasher _sut = new();

    [Fact]
    public void Hash_ReturnsNonEmptyBcryptHash()
    {
        var hash = _sut.Hash("password123");

        hash.Should().NotBeNullOrEmpty();
        hash.Should().StartWith("$2");
    }

    [Fact]
    public void Hash_SameInput_ProducesDifferentHashes()
    {
        var hash1 = _sut.Hash("password123");
        var hash2 = _sut.Hash("password123");

        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        var hash = _sut.Hash("password123");

        _sut.Verify("password123", hash).Should().BeTrue();
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = _sut.Hash("password123");

        _sut.Verify("wrong", hash).Should().BeFalse();
    }

    [Fact]
    public void Hash_DoesNotContainPlaintextPassword()
    {
        var password = "mysecretpassword";
        var hash = _sut.Hash(password);

        hash.Should().NotContain(password);
    }
}
