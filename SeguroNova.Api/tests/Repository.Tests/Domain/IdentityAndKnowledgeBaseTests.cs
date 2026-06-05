using Domain.Entities;
using Domain.Enums;

namespace Repository.Tests.Domain;

public sealed class IdentityAndKnowledgeBaseTests
{
    [Fact]
    public void KnowledgeBaseEnum_ShouldContainExpectedValuesOnly()
    {
        var names = Enum.GetNames<KnowledgeBase>();

        Assert.Equal(
        [
            "polizas",
            "siniestros",
            "rrhh",
            "legal",
            "operaciones"
        ], names);
    }

    [Fact]
    public void UserKnowledgeBase_ShouldUseKnowledgeBaseEnum()
    {
        Assert.Equal(typeof(KnowledgeBase), typeof(UserKnowledgeBase).GetProperty(nameof(UserKnowledgeBase.KnowledgeBase))!.PropertyType);
    }

    [Fact]
    public void IdentityEntities_ShouldExposeGuidKeys()
    {
        Assert.Equal(typeof(Guid), typeof(User).GetProperty(nameof(User.Id))!.PropertyType);
        Assert.Equal(typeof(Guid), typeof(Role).GetProperty(nameof(Role.Id))!.PropertyType);
        Assert.Equal(typeof(Guid), typeof(UserRole).GetProperty(nameof(UserRole.UserId))!.PropertyType);
        Assert.Equal(typeof(Guid), typeof(UserRole).GetProperty(nameof(UserRole.RoleId))!.PropertyType);
        Assert.Equal(typeof(Guid), typeof(UserKnowledgeBase).GetProperty(nameof(UserKnowledgeBase.UserId))!.PropertyType);
    }
}
