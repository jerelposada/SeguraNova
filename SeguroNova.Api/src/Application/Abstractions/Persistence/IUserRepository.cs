using Domain.Entities;

namespace Application.Abstractions.Persistence;

public interface IUserRepository
{
    Task<User?> FindByNormalizedEmailAsync(string normalizedEmail, CancellationToken ct);
}