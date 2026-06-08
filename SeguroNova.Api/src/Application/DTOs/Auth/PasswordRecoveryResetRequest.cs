using System.Text.Json.Serialization;

namespace Application.DTOs.Auth;

public sealed class PasswordRecoveryResetRequest
{
    public string Token { get; init; } = string.Empty;

    [JsonPropertyName("new_password")]
    public string NewPassword { get; init; } = string.Empty;
}
