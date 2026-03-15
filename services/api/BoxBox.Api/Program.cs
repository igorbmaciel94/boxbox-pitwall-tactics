using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using BoxBox.Api.Api.Endpoints;
using BoxBox.Api.Api.Middleware;
using BoxBox.Api.Application.Services;
using BoxBox.Api.Domain.Interfaces;
using BoxBox.Api.Infrastructure.Persistence;
using BoxBox.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// MongoDB
var mongoUri = builder.Configuration["MONGODB_URI"]
    ?? Environment.GetEnvironmentVariable("MONGODB_URI")
    ?? "mongodb://localhost:27017";
var mongoClient = new MongoClient(mongoUri);
var database = mongoClient.GetDatabase("boxbox");
builder.Services.AddSingleton(database);

// Create indexes
var usersCollection = database.GetCollection<BoxBox.Api.Domain.Entities.User>("users");
await usersCollection.Indexes.CreateOneAsync(
    new CreateIndexModel<BoxBox.Api.Domain.Entities.User>(
        Builders<BoxBox.Api.Domain.Entities.User>.IndexKeys.Ascending(u => u.Username),
        new CreateIndexOptions { Unique = true }
    )
);
var syncCollection = database.GetCollection<BoxBox.Api.Domain.Entities.SyncData>("sync_data");
await syncCollection.Indexes.CreateOneAsync(
    new CreateIndexModel<BoxBox.Api.Domain.Entities.SyncData>(
        Builders<BoxBox.Api.Domain.Entities.SyncData>.IndexKeys.Ascending(s => s.UserId),
        new CreateIndexOptions { Unique = true }
    )
);

// Domain & Infrastructure (Dependency Inversion Principle)
builder.Services.AddSingleton<ITokenService, JwtTokenService>();
builder.Services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISyncDataRepository, SyncDataRepository>();

// Application Services
builder.Services.AddScoped<AuthApplicationService>();
builder.Services.AddScoped<SyncApplicationService>();

// JWT Authentication
var tokenService = new JwtTokenService(builder.Configuration);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "boxbox-api",
            ValidAudience = "boxbox-web",
            IssuerSigningKey = tokenService.GetSecurityKey(),
        };
    });
builder.Services.AddAuthorization();

// CORS
var corsOrigin = builder.Configuration["CORS_ORIGIN"]
    ?? Environment.GetEnvironmentVariable("CORS_ORIGIN")
    ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.PermitLimit = 10;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "BoxBox Pitwall Tactics API",
        Version = "v1",
        Description = "Auth and cloud sync API for BoxBox Pitwall Tactics",
    });
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter your JWT token",
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer",
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Swagger UI at /docs
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.RoutePrefix = "docs";
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "BoxBox API v1");
});

// Map endpoints
app.MapAuthEndpoints();
app.MapSyncEndpoints();

app.MapGet("/health", async (IMongoDatabase db) =>
{
    try
    {
        await db.RunCommandAsync<BsonDocument>(new BsonDocument("ping", 1));
        return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
    catch
    {
        return Results.Json(
            new { status = "unhealthy", timestamp = DateTime.UtcNow },
            statusCode: 503);
    }
}).ExcludeFromDescription();

app.MapGet("/", () => Results.Redirect("/docs")).ExcludeFromDescription();

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
