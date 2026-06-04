namespace Domain.Entities;

public sealed class UserKnowledgeBase
{
    public Guid UserId { get; set; }

    public string KnowledgeBase { get; set; } = string.Empty;

    public User User { get; set; } = null!;
}
