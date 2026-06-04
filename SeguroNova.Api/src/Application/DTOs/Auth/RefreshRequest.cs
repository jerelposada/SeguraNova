using System.Text.Json.Serialization;

namespace Application.DTOs.Auth;

public sealed class RefreshRequest
{
    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; init; } = string.Empty;
}
