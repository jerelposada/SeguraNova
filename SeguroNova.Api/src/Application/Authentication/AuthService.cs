using Application.Abstractions.Authentication;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Abstractions.Time;
using Application.DTOs.Auth;
using Domain.Entities;

namespace Application.Authentication;

public sealed class AuthService(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IAccessTokenGenerator accessTokenGenerator,
    IPasswordHasher passwordHasher,
    ISystemClock clock) : IAuthService
{
    public async Task<AuthTokensResponse?> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await userRepository.FindByNormalizedEmailAsync(normalizedEmail, ct);
        var credentialsValid = user is not null && passwordHasher.Verify(request.Password, user.PasswordHash);
        if (!credentialsValid)
        {
            return null;
        }

        return await IssueTokenPairAsync(user!, ct);
    }

    public async Task<AuthTokensResponse?> RefreshAsync(RefreshRequest request, CancellationToken ct)
    {
        var now = clock.UtcNow;
        var tokens = await refreshTokenRepository.GetValidTokensWithUserAsync(now, ct);
        var match = tokens.FirstOrDefault(x => passwordHasher.Verify(request.RefreshToken, x.TokenHash));
        if (match is null)
        {
            return null;
        }

        match.IsRevoked = true;
        match.RevokedAtUtc = now;
        return await IssueTokenPairAsync(match.User, ct);
    }

    public async Task<bool> RevokeAsync(Guid userId, string refreshToken, CancellationToken ct)
    {
        var now = clock.UtcNow;
        var activeTokens = await refreshTokenRepository.GetActiveTokensByUserAsync(userId, now, ct);
        var revoked = false;

        foreach (var token in activeTokens)
        {
            if (!passwordHasher.Verify(refreshToken, token.TokenHash))
            {
                continue;
            }

            token.IsRevoked = true;
            token.RevokedAtUtc = now;
            revoked = true;
        }

        await refreshTokenRepository.SaveChangesAsync(ct);
        return revoked;
    }

    private async Task<AuthTokensResponse> IssueTokenPairAsync(User user, CancellationToken ct)
    {
        var now = clock.UtcNow;
        var roles = user.UserRoles.Select(x => x.Role.Name).ToList();
        var knowledgeBases = user.KnowledgeBases.Select(x => x.KnowledgeBase.ToString()).ToList();
        var accessToken = accessTokenGenerator.Generate(user, roles, knowledgeBases, now);
        var refreshToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + Guid.NewGuid().ToString("N");
        var refreshEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = passwordHasher.Hash(refreshToken),
            ExpiresAtUtc = now.AddDays(7),
            IsRevoked = false
        };

        await refreshTokenRepository.AddAsync(refreshEntity, ct);
        await refreshTokenRepository.SaveChangesAsync(ct);
        return new AuthTokensResponse { AccessToken = accessToken, RefreshToken = refreshToken, ExpiresIn = 3600 };
    }
}