using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Application.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Repository.Persistence;

namespace API.Tests.Auth;

public sealed class RefreshEndpointTests : IClassFixture<CustomApiFactory>
{
    private readonly HttpClient _client;
    private readonly CustomApiFactory _factory;

    public RefreshEndpointTests(CustomApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Refresh_WithValidToken_ShouldRotateRefreshToken()
    {
        var login = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "secret123"
        });

        var initialTokens = await login.Content.ReadFromJsonAsync<AuthTokensResponse>();
        var refreshResponse = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = initialTokens!.RefreshToken
        });

        var rotatedTokens = await refreshResponse.Content.ReadFromJsonAsync<AuthTokensResponse>();
        var oldTokenRetry = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = initialTokens.RefreshToken
        });

        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);
        Assert.NotEqual(initialTokens.RefreshToken, rotatedTokens!.RefreshToken);
        Assert.Equal(HttpStatusCode.Unauthorized, oldTokenRetry.StatusCode);
    }

    [Fact]
    public async Task Refresh_WithInvalidToken_ShouldReturnUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = "invalid-refresh"
        });

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var message = document.RootElement.GetProperty("message").GetString();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("Invalid credentials.", message);
    }

    [Fact]
    public async Task Refresh_WithExpiredToken_ShouldReturnUnauthorized()
    {
        var login = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "secret123"
        });
        var tokens = await login.Content.ReadFromJsonAsync<AuthTokensResponse>();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var refreshTokens = await context.RefreshTokens
                .Where(x => !x.IsRevoked)
                .ToListAsync();
            var token = refreshTokens.First(x => BCrypt.Net.BCrypt.Verify(tokens!.RefreshToken, x.TokenHash));
            token.ExpiresAtUtc = DateTime.UtcNow.AddMinutes(-1);
            await context.SaveChangesAsync();
        }

        var response = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = tokens!.RefreshToken
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
