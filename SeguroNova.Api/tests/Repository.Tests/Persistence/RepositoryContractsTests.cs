using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Repository.Persistence;
using Repository.Persistence.Repositories;

namespace Repository.Tests.Persistence;

public sealed class RepositoryContractsTests
{
    [Fact]
    public async Task UserRepository_ShouldFindByNormalizedEmail_WithRelationsLoaded()
    {
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "hash");
        IUserRepository repository = new UserRepository(context);

        var found = await repository.FindByNormalizedEmailAsync(user.Email, CancellationToken.None);

        Assert.NotNull(found);
        Assert.Single(found!.UserRoles);
        Assert.Single(found.KnowledgeBases);
    }

    [Fact]
    public async Task RefreshTokenRepository_ShouldFilterValidTokens_AndPersistChanges()
    {
        var now = DateTime.UtcNow;
        await using var context = await CreateContextAsync();
        var user = await SeedUserAsync(context, "agent@seguranova.local", "hash");
        await SeedRefreshTokenAsync(context, user.Id, now.AddDays(1), false);
        await SeedRefreshTokenAsync(context, user.Id, now.AddDays(-1), false);
        await SeedRefreshTokenAsync(context, user.Id, now.AddDays(1), true);

        IRefreshTokenRepository repository = new RefreshTokenRepository(context);
        var valid = await repository.GetValidTokensWithUserAsync(now, CancellationToken.None);
        var added = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = "new-hash",
            ExpiresAtUtc = now.AddDays(7)
        };

        await repository.AddAsync(added, CancellationToken.None);
        await repository.SaveChangesAsync(CancellationToken.None);

        Assert.Single(valid);
        Assert.Equal(4, await context.RefreshTokens.CountAsync());
    }

    private static async Task<User> SeedUserAsync(ApplicationDbContext context, string email, string passwordHash)
    {
        var user = new User { Id = Guid.NewGuid(), Email = email, PasswordHash = passwordHash };
        var role = new Role { Id = Guid.NewGuid(), Name = "admin_ti" };
        context.Users.Add(user);
        context.Roles.Add(role);
        context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        context.UserKnowledgeBases.Add(new UserKnowledgeBase { UserId = user.Id, KnowledgeBase = KnowledgeBase.polizas });
        await context.SaveChangesAsync();
        return user;
    }

    private static async Task SeedRefreshTokenAsync(ApplicationDbContext context, Guid userId, DateTime expiresAtUtc, bool revoked)
    {
        context.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = Guid.NewGuid().ToString("N"),
            ExpiresAtUtc = expiresAtUtc,
            IsRevoked = revoked,
            RevokedAtUtc = revoked ? DateTime.UtcNow : null
        });
        await context.SaveChangesAsync();
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
}