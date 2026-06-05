namespace Repository.Persistence;

public sealed class AuthSeedOptions
{
    public const string SectionName = "AuthSeed";

    public string AdminEmail { get; init; } = "admin@seguranova.local";

    public string AdminPassword { get; init; } = "Admin123!";

    public string AdminRole { get; init; } = "admin_ti";
}