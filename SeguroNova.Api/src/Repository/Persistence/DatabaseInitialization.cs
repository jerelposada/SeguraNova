using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Repository.Persistence;

public static class DatabaseInitialization
{
    public static async Task InitializeAsync(ApplicationDbContext context, AuthSeedOptions options, CancellationToken ct)
    {
        await context.Database.EnsureCreatedAsync(ct);

        var role = await EnsureRoleAsync(context, options, ct);
        var admin = await EnsureAdminAsync(context, options, ct);
        await EnsureUserRoleAsync(context, admin.Id, role.Id, ct);
        await EnsureKnowledgeBasesAsync(context, admin.Id, ct);
        await context.SaveChangesAsync(ct);
    }

    private static async Task<Role> EnsureRoleAsync(ApplicationDbContext context, AuthSeedOptions options, CancellationToken ct)
    {
        var role = await context.Roles.SingleOrDefaultAsync(x => x.Name == options.AdminRole, ct);
        if (role is not null)
        {
            return role;
        }

        role = new Role { Id = Guid.NewGuid(), Name = options.AdminRole };
        context.Roles.Add(role);
        return role;
    }

    private static async Task<User> EnsureAdminAsync(ApplicationDbContext context, AuthSeedOptions options, CancellationToken ct)
    {
        var email = options.AdminEmail.Trim().ToLowerInvariant();
        var user = await context.Users.SingleOrDefaultAsync(x => x.Email == email, ct);
        if (user is not null)
        {
            return user;
        }

        user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(options.AdminPassword)
        };
        context.Users.Add(user);
        return user;
    }

    private static async Task EnsureUserRoleAsync(ApplicationDbContext context, Guid userId, Guid roleId, CancellationToken ct)
    {
        var exists = await context.UserRoles.AnyAsync(x => x.UserId == userId && x.RoleId == roleId, ct);
        if (!exists)
        {
            context.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId });
        }
    }

    private static async Task EnsureKnowledgeBasesAsync(ApplicationDbContext context, Guid userId, CancellationToken ct)
    {
        var existing = await context.UserKnowledgeBases
            .Where(x => x.UserId == userId)
            .Select(x => x.KnowledgeBase)
            .ToListAsync(ct);

        foreach (var value in Enum.GetValues<KnowledgeBase>())
        {
            if (!existing.Contains(value))
            {
                context.UserKnowledgeBases.Add(new UserKnowledgeBase { UserId = userId, KnowledgeBase = value });
            }
        }
    }
}