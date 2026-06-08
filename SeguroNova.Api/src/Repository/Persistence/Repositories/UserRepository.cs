using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Repository.Persistence.Repositories;

public sealed class UserRepository(ApplicationDbContext dbContext) : IUserRepository
{
    public async Task<User?> FindByNormalizedEmailAsync(string normalizedEmail, CancellationToken ct)
    {
        return await dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Include(x => x.KnowledgeBases)
            .SingleOrDefaultAsync(x => x.Email == normalizedEmail, ct);
    }
}