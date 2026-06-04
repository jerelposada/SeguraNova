using Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Repository.Persistence;

namespace API.Tests.Auth;

public sealed class CustomApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            ReplaceDbContext(services);
            using var scope = services.BuildServiceProvider().CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            context.Database.EnsureCreated();
            Seed(context);
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _connection.Dispose();
        }
    }

    private void ReplaceDbContext(IServiceCollection services)
    {
        var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
        if (descriptor is not null)
        {
            services.Remove(descriptor);
        }

        _connection.Open();
        services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite(_connection));
    }

    private static void Seed(ApplicationDbContext context)
    {
        var userId = Guid.Parse("f4fa6481-2de1-45f9-ae5f-346371db2451");
        var roleId = Guid.Parse("68fc79ba-6bd9-4d92-ad00-63f306306de3");
        context.Users.Add(new User
        {
            Id = userId,
            Email = "agent@seguranova.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("secret123")
        });
        context.Roles.Add(new Role { Id = roleId, Name = "agente_siniestros" });
        context.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId });
        context.UserKnowledgeBases.Add(new UserKnowledgeBase { UserId = userId, KnowledgeBase = "general" });
        context.SaveChanges();
    }
}
