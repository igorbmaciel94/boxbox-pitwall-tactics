using BoxBox.Api.Domain.Entities;

namespace BoxBox.Api.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User> CreateAsync(User user);
}
