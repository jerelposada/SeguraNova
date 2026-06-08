using Domain.Entities;

namespace Application.Abstractions.Security;

public interface IAccessTokenGenerator
{
    string Generate(User user, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> knowledgeBases, DateTime nowUtc);
}