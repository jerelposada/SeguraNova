using Application.Abstractions.Authentication;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Abstractions.Time;
using Application.DTOs.Auth;
using Domain.Entities;

namespace Application.Authentication;

public sealed class AuthService(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IPasswordRecoveryTokenRepository passwordRecoveryTokenRepository,
    IPasswordRecoveryNotifier passwordRecoveryNotifier,
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

    public async Task RequestPasswordRecoveryAsync(PasswordRecoveryRequest request, CancellationToken ct)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await userRepository.FindByNormalizedEmailAsync(normalizedEmail, ct);
        if (user is null)
        {
            return;
        }

        var now = clock.UtcNow;
        var plainToken = GenerateRecoveryToken();
        var token = new PasswordRecoveryToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = passwordHasher.Hash(plainToken),
            CreatedAtUtc = now,
            ExpiresAtUtc = now.AddHours(1),
            UsedAtUtc = null
        };

        await passwordRecoveryTokenRepository.AddAsync(token, ct);
        await passwordRecoveryTokenRepository.SaveChangesAsync(ct);
        var resetUrl = BuildResetUrl(plainToken);
        await passwordRecoveryNotifier.SendResetLinkAsync(user.Email, resetUrl, ct);
    }

    public async Task<bool> ResetPasswordAsync(PasswordRecoveryResetRequest request, CancellationToken ct)
    {
        var now = clock.UtcNow;
        var pendingTokens = await passwordRecoveryTokenRepository.GetPendingTokensWithUserAsync(now, ct);
        var matchingToken = pendingTokens.FirstOrDefault(x => passwordHasher.Verify(request.Token, x.TokenHash));
        if (matchingToken is null)
        {
            return false;
        }

        matchingToken.User.PasswordHash = passwordHasher.Hash(request.NewPassword);
        matchingToken.UsedAtUtc = now;
        await passwordRecoveryTokenRepository.SaveChangesAsync(ct);
        return true;
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

    private static string GenerateRecoveryToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + Guid.NewGuid().ToString("N");
    }

    private static string BuildResetUrl(string token)
    {
        var encodedToken = Uri.EscapeDataString(token);
        return $"/reset-password?token={encodedToken}";
    }
}