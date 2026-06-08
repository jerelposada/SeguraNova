namespace Application.DTOs.Auth;

public sealed class PasswordRecoveryRequest
{
    public string Email { get; init; } = string.Empty;
}
