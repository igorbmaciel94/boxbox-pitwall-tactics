using BoxBox.Api.Api.Dtos;
using BoxBox.Api.Application.Services;
using BoxBox.Api.Domain.Exceptions;

namespace BoxBox.Api.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, AuthApplicationService authService) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Trim().Length < 3)
                return Results.BadRequest(new { error = "Username must be at least 3 characters" });

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
                return Results.BadRequest(new { error = "Password must be at least 6 characters" });

            if (request.Username.Trim().Length > 20)
                return Results.BadRequest(new { error = "Username must be at most 20 characters" });

            if (request.Password.Length > 128)
                return Results.BadRequest(new { error = "Password must be at most 128 characters" });

            try
            {
                var (user, token) = await authService.RegisterAsync(request.Username.Trim(), request.Password);
                return Results.Ok(new AuthResponse(token, user.Username, user.PlayerCode));
            }
            catch (UsernameAlreadyExistsException)
            {
                return Results.Conflict(new { error = "Username already exists" });
            }
        })
        .WithName("Register")
        .WithOpenApi()
        .RequireRateLimiting("auth");

        group.MapPost("/login", async (LoginRequest request, AuthApplicationService authService) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return Results.BadRequest(new { error = "Username and password are required" });

            try
            {
                var (user, token) = await authService.LoginAsync(request.Username.Trim(), request.Password);
                return Results.Ok(new AuthResponse(token, user.Username, user.PlayerCode));
            }
            catch (InvalidCredentialsException)
            {
                return Results.Unauthorized();
            }
        })
        .WithName("Login")
        .WithOpenApi()
        .RequireRateLimiting("auth");
    }
}
