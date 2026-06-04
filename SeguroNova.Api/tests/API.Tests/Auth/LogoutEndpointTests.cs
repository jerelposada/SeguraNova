using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.DTOs.Auth;

namespace API.Tests.Auth;

public sealed class LogoutEndpointTests : IClassFixture<CustomApiFactory>
{
    private readonly HttpClient _client;

    public LogoutEndpointTests(CustomApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Logout_WithAuthenticatedUser_ShouldReturnNoContentAndRevokeRefreshToken()
    {
        var login = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "secret123"
        });
        var tokens = await login.Content.ReadFromJsonAsync<AuthTokensResponse>();

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        var logout = await _client.PostAsJsonAsync("/api/auth/logout", new LogoutRequest
        {
            RefreshToken = tokens.RefreshToken
        });

        var refresh = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = tokens.RefreshToken
        });

        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
    }

    [Fact]
    public async Task Logout_WithoutRefreshToken_ShouldReturnBadRequest_AndNotRevokeSession()
    {
        var login = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "secret123"
        });
        var tokens = await login.Content.ReadFromJsonAsync<AuthTokensResponse>();

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        var logout = await _client.PostAsJsonAsync("/api/auth/logout", new { });

        var refresh = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = tokens.RefreshToken
        });

        Assert.Equal(HttpStatusCode.BadRequest, logout.StatusCode);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
    }
}
