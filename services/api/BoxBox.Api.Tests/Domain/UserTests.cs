using BoxBox.Api.Domain.Entities;
using FluentAssertions;

namespace BoxBox.Api.Tests.Domain;

public class UserTests
{
    [Theory]
    [InlineData("Igor", "IGO")]
    [InlineData("ana", "ANA")]
    [InlineData("JoãoSilva", "JOÃ")]
    [InlineData("abc", "ABC")]
    [InlineData("ABCDEFGH", "ABC")]
    public void DerivePlayerCode_ValidUsername_ReturnsFirst3CharsUppercase(string username, string expected)
    {
        var result = User.DerivePlayerCode(username);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("")]
    [InlineData("ab")]
    [InlineData("  ")]
    public void DerivePlayerCode_TooShort_ThrowsArgumentException(string username)
    {
        var act = () => User.DerivePlayerCode(username);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void DerivePlayerCode_Null_ThrowsArgumentException()
    {
        var act = () => User.DerivePlayerCode(null!);
        act.Should().Throw<ArgumentException>();
    }
}
