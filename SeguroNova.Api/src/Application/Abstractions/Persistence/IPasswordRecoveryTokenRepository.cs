using Domain.Entities;

namespace Application.Abstractions.Persistence;

public interface IPasswordRecoveryTokenRepository
{
    Task AddAsync(PasswordRecoveryToken token, CancellationToken ct);

    Task<IReadOnlyList<PasswordRecoveryToken>> GetPendingTokensWithUserAsync(DateTime nowUtc, CancellationToken ct);

    Task SaveChangesAsync(CancellationToken ct);
}
