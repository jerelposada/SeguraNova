namespace Application.Abstractions.Security;

public interface IPasswordHasher
{
    bool Verify(string plainText, string hash);

    string Hash(string plainText);
}