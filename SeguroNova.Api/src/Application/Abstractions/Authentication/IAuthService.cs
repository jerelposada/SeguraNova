using Application.DTOs.Auth;

namespace Application.Abstractions.Authentication;

public interface IAuthService
{
    Task<AuthTokensResponse?> LoginAsync(LoginRequest request, CancellationToken ct);

    Task<AuthTokensResponse?> RefreshAsync(RefreshRequest request, CancellationToken ct);

    Task<bool> RevokeAsync(Guid userId, string refreshToken, CancellationToken ct);
}
