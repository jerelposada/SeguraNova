using Application.Abstractions.Security;

namespace Infrastructure.Authentication;

public sealed class BcryptPasswordHasher : IPasswordHasher
{
    public bool Verify(string plainText, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(plainText, hash);
    }

    public string Hash(string plainText)
    {
        return BCrypt.Net.BCrypt.HashPassword(plainText);
    }
}