namespace Repository.Authentication;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "SeguraNova";

    public string Audience { get; init; } = "SeguraNova.Client";

    public string Secret { get; init; } = string.Empty;
}
