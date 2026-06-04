using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Auth;

public sealed class LogoutRequest
{
    [Required]
    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; init; } = string.Empty;
}
