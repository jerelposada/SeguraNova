using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Application.Abstractions.Security;
using Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Authentication;

public sealed class JwtAccessTokenGenerator(IOptions<JwtOptions> options) : IAccessTokenGenerator
{
    public string Generate(User user, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> knowledgeBases, DateTime nowUtc)
    {
        var jwtOptions = options.Value;
        var claims = BuildClaims(user, roles, knowledgeBases);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret));
        var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwtOptions.Issuer,
            audience: jwtOptions.Audience,
            claims: claims,
            notBefore: nowUtc,
            expires: nowUtc.AddMinutes(60),
            signingCredentials: signingCredentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static List<Claim> BuildClaims(User user, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> knowledgeBases)
    {
        return
        [
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("roles", JsonSerializer.Serialize(roles)),
            new Claim("knowledge_bases", JsonSerializer.Serialize(knowledgeBases))
        ];
    }
}