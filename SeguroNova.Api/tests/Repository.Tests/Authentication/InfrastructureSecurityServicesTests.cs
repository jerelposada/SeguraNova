using System.IdentityModel.Tokens.Jwt;
using Application.Abstractions.Security;
using Application.Abstractions.Time;
using Domain.Entities;
using Infrastructure.Authentication;
using Infrastructure.Time;
using Microsoft.Extensions.Options;

namespace Repository.Tests.Authentication;

public sealed class InfrastructureSecurityServicesTests
{
    [Fact]
    public void PasswordHasher_ShouldHashAndVerify()
    {
        IPasswordHasher hasher = new BcryptPasswordHasher();

        var hash = hasher.Hash("secret123");

        Assert.NotEqual("secret123", hash);
        Assert.True(hasher.Verify("secret123", hash));
        Assert.False(hasher.Verify("wrong", hash));
    }

    [Fact]
    public void JwtAccessTokenGenerator_ShouldEmitExpectedClaims_AndSixtyMinuteExpiry()
    {
        var options = Options.Create(new JwtOptions
        {
            Issuer = "SeguraNova",
            Audience = "SeguraNova.Client",
            Secret = "supersecretkeysupersecretkeysupersecretkey"
        });
        IAccessTokenGenerator generator = new JwtAccessTokenGenerator(options);
        var user = new User { Id = Guid.NewGuid(), Email = "agent@seguranova.local" };
        var now = DateTime.UtcNow;

        var token = generator.Generate(user, ["admin_ti"], ["polizas"], now);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.NotNull(jwt.Claims.SingleOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub));
        Assert.NotNull(jwt.Claims.SingleOrDefault(x => x.Type == JwtRegisteredClaimNames.Email));
        Assert.NotNull(jwt.Claims.SingleOrDefault(x => x.Type == "roles"));
        Assert.NotNull(jwt.Claims.SingleOrDefault(x => x.Type == "knowledge_bases"));
        Assert.InRange((jwt.ValidTo - now).TotalSeconds, 3598, 3602);
    }

    [Fact]
    public void SystemClock_ShouldReturnCurrentUtcTime()
    {
        ISystemClock clock = new SystemClock();

        Assert.InRange((clock.UtcNow - DateTime.UtcNow).TotalSeconds, -1, 1);
    }
}