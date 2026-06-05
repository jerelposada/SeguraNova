using Application.DTOs.Auth;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Repository.Authentication;
using Repository.Persistence;

namespace Repository.Tests.Authentication;

public sealed class AuthServiceBehaviorTests
{
    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnTokens()
    {
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        var service = CreateService(context, new FakeClock(DateTime.UtcNow));

        var result = await service.LoginAsync(new LoginRequest { Email = user.Email, Password = "secret123" }, CancellationToken.None);

        Assert.NotNull(result);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidCredentials_ShouldReturnNull()
    {
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        var service = CreateService(context, new FakeClock(DateTime.UtcNow));

        var result = await service.LoginAsync(new LoginRequest { Email = user.Email, Password = "wrong" }, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task RefreshAsync_WithValidToken_ShouldRotateRefreshToken()
    {
        var now = DateTime.UtcNow;
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        var service = CreateService(context, new FakeClock(now));

        var issued = await service.LoginAsync(new LoginRequest { Email = user.Email, Password = "secret123" }, CancellationToken.None);
        var refreshed = await service.RefreshAsync(new RefreshRequest { RefreshToken = issued!.RefreshToken }, CancellationToken.None);

        Assert.NotEqual(issued.RefreshToken, refreshed!.RefreshToken);
    }

    [Fact]
    public async Task RefreshAsync_WithInvalidToken_ShouldReturnNull()
    {
        await using var context = await CreateContextAsync();
        await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        var service = CreateService(context, new FakeClock(DateTime.UtcNow));

        var refreshed = await service.RefreshAsync(new RefreshRequest { RefreshToken = "invalid-token" }, CancellationToken.None);

        Assert.Null(refreshed);
    }

    [Fact]
    public async Task RevokeAsync_WithValidToken_ShouldReturnTrue()
    {
        var now = DateTime.UtcNow;
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        var service = CreateService(context, new FakeClock(now));
        var issued = await service.LoginAsync(new LoginRequest { Email = user.Email, Password = "secret123" }, CancellationToken.None);

        var revoked = await service.RevokeAsync(user.Id, issued!.RefreshToken, CancellationToken.None);

        Assert.True(revoked);
    }

    [Fact]
    public async Task RevokeAsync_WithUnknownToken_ShouldReturnFalse()
    {
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        var service = CreateService(context, new FakeClock(DateTime.UtcNow));

        var revoked = await service.RevokeAsync(user.Id, "invalid-token", CancellationToken.None);

        Assert.False(revoked);
    }

    private static AuthService CreateService(ApplicationDbContext context, ISystemClock clock)
    {
        return new AuthService(context, new FakeAccessTokenGenerator(), clock);
    }

    private static async Task<User> SeedUserAsync(ApplicationDbContext context, string email, string password)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };
        var role = new Role { Id = Guid.NewGuid(), Name = "admin_ti" };
        context.Users.Add(user);
        context.Roles.Add(role);
        context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        context.UserKnowledgeBases.Add(new UserKnowledgeBase { UserId = user.Id, KnowledgeBase = KnowledgeBase.polizas });
        await context.SaveChangesAsync();
        return user;
    }

    private static async Task<ApplicationDbContext> CreateContextAsync()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;
        var context = new ApplicationDbContext(options);
        await context.Database.EnsureCreatedAsync();
        return context;
    }

    private sealed class FakeAccessTokenGenerator : IAccessTokenGenerator
    {
        public string Generate(User user, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> knowledgeBases, DateTime nowUtc)
        {
            return $"fake-jwt-{user.Id}";
        }
    }

    private sealed class FakeClock(DateTime utcNow) : ISystemClock
    {
        public DateTime UtcNow { get; } = utcNow;
    }
}