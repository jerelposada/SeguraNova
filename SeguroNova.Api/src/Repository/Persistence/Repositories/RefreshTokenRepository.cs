using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Repository.Persistence.Repositories;

public sealed class RefreshTokenRepository(ApplicationDbContext dbContext) : IRefreshTokenRepository
{
    public async Task<IReadOnlyList<RefreshToken>> GetActiveTokensByUserAsync(Guid userId, DateTime nowUtc, CancellationToken ct)
    {
        return await dbContext.RefreshTokens
            .Where(x => x.UserId == userId && !x.IsRevoked && x.ExpiresAtUtc > nowUtc)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<RefreshToken>> GetValidTokensWithUserAsync(DateTime nowUtc, CancellationToken ct)
    {
        return await dbContext.RefreshTokens
            .Include(x => x.User)
            .ThenInclude(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Include(x => x.User.KnowledgeBases)
            .Where(x => !x.IsRevoked && x.ExpiresAtUtc > nowUtc)
            .ToListAsync(ct);
    }

    public async Task AddAsync(RefreshToken token, CancellationToken ct)
    {
        await dbContext.RefreshTokens.AddAsync(token, ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await dbContext.SaveChangesAsync(ct);
    }
}