using Domain.Entities;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Repository.Persistence;

namespace Repository.Tests.Persistence;

public sealed class ApplicationDbContextMappingTests
{
    [Fact]
    public async Task ShouldPersistUserRoleAndKnowledgeBaseRelationships()
    {
        await using var context = await CreateContextAsync();
        var user = new User { Id = Guid.NewGuid(), Email = "agent@segura.local", PasswordHash = "hash" };
        var role = new Role { Id = Guid.NewGuid(), Name = "agente_siniestros" };

        context.Users.Add(user);
        context.Roles.Add(role);
        context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        context.UserKnowledgeBases.Add(new UserKnowledgeBase { UserId = user.Id, KnowledgeBase = "claims" });
        await context.SaveChangesAsync();

        var loadedUser = await context.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Include(x => x.KnowledgeBases)
            .SingleAsync(x => x.Id == user.Id);

        Assert.Single(loadedUser.UserRoles);
        Assert.Equal("agente_siniestros", loadedUser.UserRoles[0].Role.Name);
        Assert.Single(loadedUser.KnowledgeBases);
        Assert.Equal("claims", loadedUser.KnowledgeBases[0].KnowledgeBase);
    }

    [Fact]
    public async Task ShouldStoreOnlyRefreshTokenHashWithSevenDaysExpiration()
    {
        await using var context = await CreateContextAsync();
        var user = new User { Id = Guid.NewGuid(), Email = "admin@segura.local", PasswordHash = "hash" };
        var expiresAt = DateTime.UtcNow.AddDays(7);

        context.Users.Add(user);
        context.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = "hashed-token",
            ExpiresAtUtc = expiresAt,
            IsRevoked = false
        });

        await context.SaveChangesAsync();

        var storedToken = await context.RefreshTokens.SingleAsync();
        Assert.Equal("hashed-token", storedToken.TokenHash);
        Assert.True((storedToken.ExpiresAtUtc - DateTime.UtcNow).TotalDays > 6.99);
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
