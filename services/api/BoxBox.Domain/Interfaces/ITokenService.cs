using Microsoft.IdentityModel.Tokens;

namespace BoxBox.Api.Domain.Interfaces;

public interface ITokenService
{
    string GenerateToken(string userId, string username, string playerCode);
    SymmetricSecurityKey GetSecurityKey();
}
