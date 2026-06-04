using Domain.Entities;

namespace Repository.Authentication;

public interface IAccessTokenGenerator
{
    string Generate(User user, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> knowledgeBases, DateTime nowUtc);
}
