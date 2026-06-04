using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Application.DTOs.Auth;

namespace API.Tests.Auth;

public sealed class LoginEndpointTests : IClassFixture<CustomApiFactory>
{
    private readonly HttpClient _client;

    public LoginEndpointTests(CustomApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnTokenPair()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "secret123"
        });

        var payload = await response.Content.ReadFromJsonAsync<AuthTokensResponse>();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(payload?.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(payload?.RefreshToken));
        Assert.Equal("Bearer", payload?.TokenType);
        Assert.Equal(3600, payload?.ExpiresIn);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorizedWithGenericMessage()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "wrong"
        });

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var message = document.RootElement.GetProperty("message").GetString();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("Invalid credentials.", message);
    }
}
