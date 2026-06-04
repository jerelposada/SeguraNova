using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace API.Tests.Auth;

public sealed class JwtConfigurationTests : IClassFixture<CustomApiFactory>
{
    private readonly CustomApiFactory _factory;

    public JwtConfigurationTests(CustomApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public void JwtBearer_ShouldUseStrictValidationAndZeroClockSkew()
    {
        var optionsMonitor = _factory.Services.GetRequiredService<IOptionsMonitor<JwtBearerOptions>>();
        var options = optionsMonitor.Get(JwtBearerDefaults.AuthenticationScheme);
        var parameters = options.TokenValidationParameters;

        Assert.True(parameters.ValidateIssuerSigningKey);
        Assert.True(parameters.ValidateLifetime);
        Assert.Equal(TimeSpan.Zero, parameters.ClockSkew);
    }
}
