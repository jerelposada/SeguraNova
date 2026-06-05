using Domain.Enums;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Repository.Persistence;

namespace Repository.Tests.Persistence;

public sealed class DatabaseInitializationTests
{
    [Fact]
    public async Task InitializeAsync_ShouldSeedAdminUserRoleAndKnowledgeBaseIdempotently()
    {
        await using var context = await CreateContextAsync();
        var options = new AuthSeedOptions
        {
            AdminEmail = "admin@seguranova.local",
            AdminPassword = "Admin123!",
            AdminRole = "admin_ti"
        };

        await DatabaseInitialization.InitializeAsync(context, options, CancellationToken.None);
        await DatabaseInitialization.InitializeAsync(context, options, CancellationToken.None);

        var admin = await context.Users.SingleAsync(x => x.Email == options.AdminEmail);
        var role = await context.Roles.SingleAsync(x => x.Name == options.AdminRole);
        var userRoleCount = await context.UserRoles.CountAsync(x => x.UserId == admin.Id && x.RoleId == role.Id);
        var knowledgeBaseCount = await context.UserKnowledgeBases.CountAsync(x => x.UserId == admin.Id);

        Assert.True(BCrypt.Net.BCrypt.Verify(options.AdminPassword, admin.PasswordHash));
        Assert.Equal(1, userRoleCount);
        Assert.Equal(Enum.GetNames<KnowledgeBase>().Length, knowledgeBaseCount);
    }

    [Fact]
    public async Task ContextModel_ShouldExposeExpectedUniqueIndexes()
    {
        await using var context = await CreateContextAsync();
        var userEntity = context.Model.FindEntityType(typeof(global::Domain.Entities.User));
        var roleEntity = context.Model.FindEntityType(typeof(global::Domain.Entities.Role));

        Assert.Contains(userEntity!.GetIndexes(), x => x.IsUnique && x.Properties.Single().Name == nameof(global::Domain.Entities.User.Email));
        Assert.Contains(roleEntity!.GetIndexes(), x => x.IsUnique && x.Properties.Single().Name == nameof(global::Domain.Entities.Role.Name));
    }

    [Fact]
    public async Task Context_ShouldExposeInitialMigration()
    {
        await using var context = await CreateContextAsync();
        var migrations = context.Database.GetMigrations();

        Assert.Contains(migrations, x => x.Contains("Initial", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void InitialMigration_ShouldGeneratePostgreSqlScript()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql("Host=localhost;Database=seguranova_test;Username=postgres;Password=postgres")
            .Options;

        using var context = new ApplicationDbContext(options);
        var migrator = context.GetService<IMigrator>();
        var sql = migrator.GenerateScript(options: MigrationsSqlGenerationOptions.Idempotent);

        Assert.Contains("CREATE TABLE \"Users\"", sql, StringComparison.Ordinal);
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
