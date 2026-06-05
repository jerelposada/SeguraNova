using Application.Abstractions.Authentication;
using Application.DTOs.Auth;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Persistence;

namespace Repository.Authentication;

public sealed class AuthService(
    ApplicationDbContext dbContext,
    IAccessTokenGenerator accessTokenGenerator,
    ISystemClock clock) : IAuthService
{
    public async Task<AuthTokensResponse?> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await LoadUserByEmailAsync(normalizedEmail, ct);
        var credentialsValid = user is not null && BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!credentialsValid)
        {
            return null;
        }

        return await IssueTokenPairAsync(user!, ct);
    }

    public async Task<AuthTokensResponse?> RefreshAsync(RefreshRequest request, CancellationToken ct)
    {
        var now = clock.UtcNow;
        var tokens = await dbContext.RefreshTokens.Include(x => x.User)
            .ThenInclude(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Include(x => x.User.KnowledgeBases)
            .Where(x => !x.IsRevoked && x.ExpiresAtUtc > now)
            .ToListAsync(ct);

        var match = tokens.FirstOrDefault(x => BCrypt.Net.BCrypt.Verify(request.RefreshToken, x.TokenHash));
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
        var activeTokens = await dbContext.RefreshTokens
            .Where(x => x.UserId == userId && !x.IsRevoked)
            .ToListAsync(ct);

        var now = clock.UtcNow;
        var revoked = false;
        foreach (var token in activeTokens)
        {
            if (BCrypt.Net.BCrypt.Verify(refreshToken, token.TokenHash))
            {
                token.IsRevoked = true;
                token.RevokedAtUtc = now;
                revoked = true;
            }
        }

        await dbContext.SaveChangesAsync(ct);
        return revoked;
    }

    private async Task<User?> LoadUserByEmailAsync(string normalizedEmail, CancellationToken ct)
    {
        return await dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Include(x => x.KnowledgeBases)
            .SingleOrDefaultAsync(x => x.Email == normalizedEmail, ct);
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
            TokenHash = BCrypt.Net.BCrypt.HashPassword(refreshToken),
            ExpiresAtUtc = now.AddDays(7),
            IsRevoked = false
        };
        dbContext.RefreshTokens.Add(refreshEntity);
        await dbContext.SaveChangesAsync(ct);
        return new AuthTokensResponse { AccessToken = accessToken, RefreshToken = refreshToken, ExpiresIn = 3600 };
    }
}
