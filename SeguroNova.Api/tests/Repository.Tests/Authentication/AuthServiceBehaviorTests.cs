using Application.Authentication;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Abstractions.Time;
using Application.DTOs.Auth;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Repository.Persistence;
using Repository.Persistence.Repositories;

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

    [Fact]
    public async Task RequestPasswordRecoveryAsync_WithExistingEmail_ShouldPersistOneHourToken()
    {
        var now = DateTime.UtcNow;
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        var service = CreateService(context, new FakeClock(now));

        await service.RequestPasswordRecoveryAsync(new PasswordRecoveryRequest { Email = user.Email }, CancellationToken.None);

        var token = await context.PasswordRecoveryTokens.SingleAsync();
        Assert.Equal(user.Id, token.UserId);
        Assert.Equal(now.AddHours(1), token.ExpiresAtUtc);
        Assert.Null(token.UsedAtUtc);
    }

    [Fact]
    public async Task RequestPasswordRecoveryAsync_WithUnknownEmail_ShouldNotPersistToken()
    {
        await using var context = await CreateContextAsync();
        await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        var service = CreateService(context, new FakeClock(DateTime.UtcNow));

        await service.RequestPasswordRecoveryAsync(new PasswordRecoveryRequest { Email = "missing@seguranova.local" }, CancellationToken.None);

        Assert.Empty(context.PasswordRecoveryTokens);
    }

    [Fact]
    public async Task ResetPasswordAsync_WithValidToken_ShouldUpdatePasswordAndPreventReuse()
    {
        var now = DateTime.UtcNow;
        const string plainToken = "recovery-token";
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        context.PasswordRecoveryTokens.Add(new PasswordRecoveryToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = BCrypt.Net.BCrypt.HashPassword(plainToken),
            CreatedAtUtc = now,
            ExpiresAtUtc = now.AddHours(1),
            UsedAtUtc = null
        });
        await context.SaveChangesAsync();
        var service = CreateService(context, new FakeClock(now));

        var resetApplied = await service.ResetPasswordAsync(new PasswordRecoveryResetRequest
        {
            Token = plainToken,
            NewPassword = "NewPassword123"
        }, CancellationToken.None);

        var reused = await service.ResetPasswordAsync(new PasswordRecoveryResetRequest
        {
            Token = plainToken,
            NewPassword = "AnotherPassword123"
        }, CancellationToken.None);

        Assert.True(resetApplied);
        Assert.False(reused);
        Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword123", user.PasswordHash));
        Assert.NotNull(context.PasswordRecoveryTokens.Single().UsedAtUtc);
    }

    [Fact]
    public async Task ResetPasswordAsync_WithExpiredOrUnknownToken_ShouldReturnFalse()
    {
        var now = DateTime.UtcNow;
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "secret123");
        context.PasswordRecoveryTokens.Add(new PasswordRecoveryToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = BCrypt.Net.BCrypt.HashPassword("expired-token"),
            CreatedAtUtc = now.AddHours(-2),
            ExpiresAtUtc = now.AddMinutes(-1),
            UsedAtUtc = null
        });
        await context.SaveChangesAsync();
        var service = CreateService(context, new FakeClock(now));

        var resetApplied = await service.ResetPasswordAsync(new PasswordRecoveryResetRequest
        {
            Token = "expired-token",
            NewPassword = "NewPassword123"
        }, CancellationToken.None);

        Assert.False(resetApplied);
    }

    private static AuthService CreateService(ApplicationDbContext context, ISystemClock clock)
    {
        IUserRepository userRepository = new UserRepository(context);
        IRefreshTokenRepository refreshTokenRepository = new RefreshTokenRepository(context);
        IPasswordRecoveryTokenRepository passwordRecoveryTokenRepository = new PasswordRecoveryTokenRepository(context);
        return new AuthService(
            userRepository,
            refreshTokenRepository,
            passwordRecoveryTokenRepository,
            new FakePasswordRecoveryNotifier(),
            new FakeAccessTokenGenerator(),
            new FakePasswordHasher(),
            clock);
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

    private sealed class FakePasswordHasher : IPasswordHasher
    {
        public bool Verify(string plainText, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(plainText, hash);
        }

        public string Hash(string plainText)
        {
            return BCrypt.Net.BCrypt.HashPassword(plainText);
        }
    }

    private sealed class FakeClock(DateTime utcNow) : ISystemClock
    {
        public DateTime UtcNow { get; } = utcNow;
    }

    private sealed class FakePasswordRecoveryNotifier : Application.Abstractions.Notifications.IPasswordRecoveryNotifier
    {
        public Task SendResetLinkAsync(string email, string resetUrl, CancellationToken ct)
        {
            return Task.CompletedTask;
        }
    }
}
