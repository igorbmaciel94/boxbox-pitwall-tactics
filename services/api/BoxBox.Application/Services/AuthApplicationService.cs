using BoxBox.Api.Domain.Entities;
using BoxBox.Api.Domain.Exceptions;
using BoxBox.Api.Domain.Interfaces;

namespace BoxBox.Api.Application.Services;

public class AuthApplicationService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthApplicationService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<(User User, string Token)> RegisterAsync(string username, string password)
    {
        username = username.ToLowerInvariant();
        var existing = await _userRepository.GetByUsernameAsync(username);
        if (existing != null)
            throw new UsernameAlreadyExistsException();

        var user = new User
        {
            Username = username,
            PlayerCode = User.DerivePlayerCode(username),
            PasswordHash = _passwordHasher.Hash(password),
            CreatedAt = DateTime.UtcNow,
        };

        await _userRepository.CreateAsync(user);
        var token = _tokenService.GenerateToken(user.Id, user.Username, user.PlayerCode);

        return (user, token);
    }

    public async Task<(User User, string Token)> LoginAsync(string username, string password)
    {
        username = username.ToLowerInvariant();
        var user = await _userRepository.GetByUsernameAsync(username);
        if (user == null || !_passwordHasher.Verify(password, user.PasswordHash))
            throw new InvalidCredentialsException();

        var token = _tokenService.GenerateToken(user.Id, user.Username, user.PlayerCode);
        return (user, token);
    }
}
