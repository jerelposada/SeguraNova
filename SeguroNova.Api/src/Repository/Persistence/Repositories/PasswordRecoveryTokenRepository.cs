using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Repository.Persistence.Repositories;

public sealed class PasswordRecoveryTokenRepository(ApplicationDbContext dbContext) : IPasswordRecoveryTokenRepository
{
    public async Task AddAsync(PasswordRecoveryToken token, CancellationToken ct)
    {
        await dbContext.PasswordRecoveryTokens.AddAsync(token, ct);
    }

    public async Task<IReadOnlyList<PasswordRecoveryToken>> GetPendingTokensWithUserAsync(DateTime nowUtc, CancellationToken ct)
    {
        return await dbContext.PasswordRecoveryTokens
            .Include(x => x.User)
            .Where(x => x.UsedAtUtc == null && x.ExpiresAtUtc > nowUtc)
            .ToListAsync(ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await dbContext.SaveChangesAsync(ct);
    }
}
