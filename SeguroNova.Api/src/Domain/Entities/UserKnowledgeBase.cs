using Domain.Enums;

namespace Domain.Entities;

public sealed class UserKnowledgeBase
{
    public Guid UserId { get; set; }

    public KnowledgeBase KnowledgeBase { get; set; }

    public User User { get; set; } = null!;
}
