using BoxBox.Api.Application.Services;
using BoxBox.Api.Domain.Entities;
using BoxBox.Api.Domain.Exceptions;
using BoxBox.Api.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace BoxBox.Api.Tests.Application;

public class AuthApplicationServiceTests
{
    private readonly Mock<IUserRepository> _userRepo;
    private readonly Mock<IPasswordHasher> _hasher;
    private readonly Mock<ITokenService> _tokenService;
    private readonly AuthApplicationService _sut;

    public AuthApplicationServiceTests()
    {
        _userRepo = new Mock<IUserRepository>();
        _hasher = new Mock<IPasswordHasher>();
        _tokenService = new Mock<ITokenService>();
        _sut = new AuthApplicationService(_userRepo.Object, _hasher.Object, _tokenService.Object);
    }

    [Fact]
    public async Task RegisterAsync_NewUser_CreatesUserAndReturnsToken()
    {
        _userRepo.Setup(r => r.GetByUsernameAsync("igor")).ReturnsAsync((User?)null);
        _hasher.Setup(h => h.Hash("password123")).Returns("hashed");
        _userRepo.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => { u.Id = "abc123"; return u; });
        _tokenService.Setup(t => t.GenerateToken("abc123", "igor", "IGO")).Returns("jwt-token");

        var (user, token) = await _sut.RegisterAsync("igor", "password123");

        user.Username.Should().Be("igor");
        user.PlayerCode.Should().Be("IGO");
        user.PasswordHash.Should().Be("hashed");
        token.Should().Be("jwt-token");
    }

    [Fact]
    public async Task RegisterAsync_ExistingUsername_ThrowsUsernameAlreadyExists()
    {
        _userRepo.Setup(r => r.GetByUsernameAsync("igor"))
            .ReturnsAsync(new User { Username = "igor" });

        var act = () => _sut.RegisterAsync("igor", "password123");

        await act.Should().ThrowAsync<UsernameAlreadyExistsException>();
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsUserAndToken()
    {
        var user = new User { Id = "abc123", Username = "igor", PlayerCode = "IGO", PasswordHash = "hashed" };
        _userRepo.Setup(r => r.GetByUsernameAsync("igor")).ReturnsAsync(user);
        _hasher.Setup(h => h.Verify("password123", "hashed")).Returns(true);
        _tokenService.Setup(t => t.GenerateToken("abc123", "igor", "IGO")).Returns("jwt-token");

        var (result, token) = await _sut.LoginAsync("igor", "password123");

        result.Username.Should().Be("igor");
        token.Should().Be("jwt-token");
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ThrowsInvalidCredentials()
    {
        _userRepo.Setup(r => r.GetByUsernameAsync("unknown")).ReturnsAsync((User?)null);

        var act = () => _sut.LoginAsync("unknown", "password123");

        await act.Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsInvalidCredentials()
    {
        var user = new User { Id = "abc123", Username = "igor", PasswordHash = "hashed" };
        _userRepo.Setup(r => r.GetByUsernameAsync("igor")).ReturnsAsync(user);
        _hasher.Setup(h => h.Verify("wrong", "hashed")).Returns(false);

        var act = () => _sut.LoginAsync("igor", "wrong");

        await act.Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task RegisterAsync_PasswordIsHashed_NeverStoredPlaintext()
    {
        _userRepo.Setup(r => r.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("$2a$12$hash");
        _userRepo.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => { u.Id = "id"; return u; });
        _tokenService.Setup(t => t.GenerateToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns("t");

        await _sut.RegisterAsync("test", "mypassword");

        _userRepo.Verify(r => r.CreateAsync(It.Is<User>(u => u.PasswordHash == "$2a$12$hash" && u.PasswordHash != "mypassword")));
    }
}
