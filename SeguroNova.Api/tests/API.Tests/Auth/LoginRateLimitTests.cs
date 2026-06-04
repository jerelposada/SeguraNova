using System.Net;
using System.Net.Http.Json;
using Application.DTOs.Auth;

namespace API.Tests.Auth;

public sealed class LoginRateLimitTests : IClassFixture<CustomApiFactory>
{
    private readonly HttpClient _client;

    public LoginRateLimitTests(CustomApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_ShouldAllowOnlyFiveAttemptsPerMinutePerIp()
    {
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var unauthorized = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                Email = "agent@seguranova.local",
                Password = "wrong"
            });

            Assert.Equal(HttpStatusCode.Unauthorized, unauthorized.StatusCode);
        }

        var limited = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "wrong"
        });

        Assert.Equal((HttpStatusCode)429, limited.StatusCode);
    }
}
