using System.Reflection;
using Application.Abstractions.Authentication;
using Application.DTOs.Auth;

namespace Application.Tests.Authentication;

public class AuthContractsTests
{
    [Fact]
    public void LoginRequest_And_RefreshRequest_ShouldExposeExpectedProperties()
    {
        var loginProperties = typeof(LoginRequest).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var refreshProperties = typeof(RefreshRequest).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        Assert.Contains(loginProperties, p => p.Name == "Email" && p.PropertyType == typeof(string));
        Assert.Contains(loginProperties, p => p.Name == "Password" && p.PropertyType == typeof(string));
        Assert.Contains(refreshProperties, p => p.Name == "RefreshToken" && p.PropertyType == typeof(string));
    }

    [Fact]
    public void AuthTokensResponse_ShouldExposeSnakeCasePayloadFields()
    {
        var properties = typeof(AuthTokensResponse).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        Assert.Contains(properties, p => p.Name == "AccessToken" && p.PropertyType == typeof(string));
        Assert.Contains(properties, p => p.Name == "RefreshToken" && p.PropertyType == typeof(string));
        Assert.Contains(properties, p => p.Name == "TokenType" && p.PropertyType == typeof(string));
        Assert.Contains(properties, p => p.Name == "ExpiresIn" && p.PropertyType == typeof(int));
    }

    [Fact]
    public void IAuthService_ShouldExposeExpectedAsyncMethods()
    {
        var methods = typeof(IAuthService).GetMethods(BindingFlags.Public | BindingFlags.Instance);

        Assert.Contains(methods, m =>
            m.Name == "LoginAsync" &&
            m.ReturnType == typeof(Task<AuthTokensResponse>) &&
            HasParameters(m, typeof(LoginRequest), typeof(CancellationToken)));

        Assert.Contains(methods, m =>
            m.Name == "RefreshAsync" &&
            m.ReturnType == typeof(Task<AuthTokensResponse>) &&
            HasParameters(m, typeof(string), typeof(CancellationToken)));

        Assert.Contains(methods, m =>
            m.Name == "RevokeAsync" &&
            m.ReturnType == typeof(Task) &&
            HasParameters(m, typeof(Guid), typeof(string), typeof(CancellationToken)));
    }

    private static bool HasParameters(MethodInfo methodInfo, params Type[] expectedTypes)
    {
        var parameters = methodInfo.GetParameters();
        if (parameters.Length != expectedTypes.Length)
        {
            return false;
        }

        for (var index = 0; index < parameters.Length; index++)
        {
            if (parameters[index].ParameterType != expectedTypes[index])
            {
                return false;
            }
        }

        return true;
    }
}
