using BoxBox.Api.Domain.Exceptions;
using FluentAssertions;

namespace BoxBox.Api.Tests.Domain;

public class DomainExceptionTests
{
    [Fact]
    public void UsernameAlreadyExistsException_Has409StatusCode()
    {
        var ex = new UsernameAlreadyExistsException();
        ex.StatusCode.Should().Be(409);
        ex.Message.Should().Contain("already exists");
    }

    [Fact]
    public void InvalidCredentialsException_Has401StatusCode()
    {
        var ex = new InvalidCredentialsException();
        ex.StatusCode.Should().Be(401);
    }

    [Fact]
    public void UserNotFoundException_Has404StatusCode()
    {
        var ex = new UserNotFoundException();
        ex.StatusCode.Should().Be(404);
    }

    [Fact]
    public void DomainException_DefaultStatusCode_Is400()
    {
        var ex = new DomainException("test error");
        ex.StatusCode.Should().Be(400);
    }

    [Fact]
    public void DomainException_CustomStatusCode_IsPreserved()
    {
        var ex = new DomainException("test", 422);
        ex.StatusCode.Should().Be(422);
    }
}
