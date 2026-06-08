using Domain.Entities;

namespace Application.Abstractions.Persistence;

public interface IRefreshTokenRepository
{
    Task<IReadOnlyList<RefreshToken>> GetActiveTokensByUserAsync(Guid userId, DateTime nowUtc, CancellationToken ct);

    Task<IReadOnlyList<RefreshToken>> GetValidTokensWithUserAsync(DateTime nowUtc, CancellationToken ct);

    Task AddAsync(RefreshToken token, CancellationToken ct);

    Task SaveChangesAsync(CancellationToken ct);
}