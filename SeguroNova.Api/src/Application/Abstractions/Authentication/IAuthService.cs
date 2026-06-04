using Application.DTOs.Auth;

namespace Application.Abstractions.Authentication;

public interface IAuthService
{
    Task<AuthTokensResponse> LoginAsync(LoginRequest request, CancellationToken ct);

    Task<AuthTokensResponse> RefreshAsync(string refreshToken, CancellationToken ct);

    Task RevokeAsync(Guid userId, string refreshToken, CancellationToken ct);
}
