namespace Domain.Entities;

public sealed class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public List<UserRole> UserRoles { get; set; } = [];

    public List<UserKnowledgeBase> KnowledgeBases { get; set; } = [];

    public List<RefreshToken> RefreshTokens { get; set; } = [];

    public List<PasswordRecoveryToken> PasswordRecoveryTokens { get; set; } = [];
}
