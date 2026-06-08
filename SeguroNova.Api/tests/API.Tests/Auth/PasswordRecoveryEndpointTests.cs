using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Application.DTOs.Auth;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Repository.Persistence;

namespace API.Tests.Auth;

public sealed class PasswordRecoveryEndpointTests : IClassFixture<CustomApiFactory>
{
    private readonly HttpClient _client;
    private readonly CustomApiFactory _factory;

    public PasswordRecoveryEndpointTests(CustomApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Request_WithExistingEmail_ShouldReturnGenericMessage_AndPersistToken()
    {
        int beforeCount;
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            beforeCount = await context.PasswordRecoveryTokens.CountAsync();
        }

        var response = await _client.PostAsJsonAsync("/api/auth/password-recovery/request", new PasswordRecoveryRequest
        {
            Email = "agent@seguranova.local"
        });

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var message = document.RootElement.GetProperty("message").GetString();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("If the email exists, recovery instructions were sent.", message);

        using var validationScope = _factory.Services.CreateScope();
        var validationContext = validationScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Assert.Equal(beforeCount + 1, await validationContext.PasswordRecoveryTokens.CountAsync());
    }

    [Fact]
    public async Task Request_WithUnknownEmail_ShouldReturnSameGenericMessage_WithoutPersistingToken()
    {
        int beforeCount;
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            beforeCount = await context.PasswordRecoveryTokens.CountAsync();
        }

        var response = await _client.PostAsJsonAsync("/api/auth/password-recovery/request", new PasswordRecoveryRequest
        {
            Email = "missing@seguranova.local"
        });

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var message = document.RootElement.GetProperty("message").GetString();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("If the email exists, recovery instructions were sent.", message);

        using var validationScope = _factory.Services.CreateScope();
        var validationContext = validationScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Assert.Equal(beforeCount, await validationContext.PasswordRecoveryTokens.CountAsync());
    }

    [Fact]
    public async Task Reset_WithValidToken_ShouldUpdatePasswordAndMarkTokenUsed()
    {
        const string token = "valid-reset-token";
        var now = DateTime.UtcNow;
        var recoveryTokenId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await context.Users.SingleAsync(x => x.Email == "agent@seguranova.local");
            context.PasswordRecoveryTokens.Add(new PasswordRecoveryToken
            {
                Id = recoveryTokenId,
                UserId = user.Id,
                TokenHash = BCrypt.Net.BCrypt.HashPassword(token),
                CreatedAtUtc = now,
                ExpiresAtUtc = now.AddHours(1),
                UsedAtUtc = null
            });
            await context.SaveChangesAsync();
        }

        var response = await _client.PostAsJsonAsync("/api/auth/password-recovery/reset", new PasswordRecoveryResetRequest
        {
            Token = token,
            NewPassword = "NewPassword123"
        });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await context.Users.SingleAsync(x => x.Email == "agent@seguranova.local");
            var recoveryToken = await context.PasswordRecoveryTokens.SingleAsync(x => x.Id == recoveryTokenId);
            Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword123", user.PasswordHash));
            Assert.NotNull(recoveryToken.UsedAtUtc);
        }

        var login = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "agent@seguranova.local",
            Password = "NewPassword123"
        });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task Reset_WithInvalidOrExpiredToken_ShouldReturnBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/password-recovery/reset", new PasswordRecoveryResetRequest
        {
            Token = "invalid-token",
            NewPassword = "NewPassword123"
        });

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var message = document.RootElement.GetProperty("message").GetString();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Invalid or expired recovery token.", message);
    }
}
