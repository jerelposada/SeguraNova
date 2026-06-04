using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using Application.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Repository.Persistence;

namespace API.Tests.Auth;

public sealed class TokenEmissionTests : IClassFixture<CustomApiFactory>
{
    private readonly HttpClient _client;
    private readonly CustomApiFactory _factory;

    public TokenEmissionTests(CustomApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_ShouldEmitAccessTokenWithRequiredClaimsAndSixtyMinuteExpiry()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "secret123"
        });

        var tokens = await response.Content.ReadFromJsonAsync<AuthTokensResponse>();
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(tokens!.AccessToken);
        var expiresIn = jwt.ValidTo - DateTime.UtcNow;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(jwt.Claims.SingleOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub));
        Assert.NotNull(jwt.Claims.SingleOrDefault(x => x.Type == JwtRegisteredClaimNames.Email));
        Assert.NotNull(jwt.Claims.SingleOrDefault(x => x.Type == "roles"));
        Assert.NotNull(jwt.Claims.SingleOrDefault(x => x.Type == "knowledge_bases"));
        Assert.InRange(expiresIn.TotalSeconds, 3598, 3602);
    }

    [Fact]
    public async Task Login_ShouldPersistOnlyRefreshHashWithSevenDaysTtl()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "secret123"
        });

        var tokens = await response.Content.ReadFromJsonAsync<AuthTokensResponse>();
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var stored = await context.RefreshTokens.OrderByDescending(x => x.ExpiresAtUtc).FirstAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(tokens!.RefreshToken, stored.TokenHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(tokens.RefreshToken, stored.TokenHash));
        Assert.InRange((stored.ExpiresAtUtc - DateTime.UtcNow).TotalDays, 6.99, 7.01);
    }
}
