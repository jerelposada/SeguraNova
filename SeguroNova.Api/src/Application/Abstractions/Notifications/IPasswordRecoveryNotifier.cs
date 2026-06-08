namespace Application.Abstractions.Notifications;

public interface IPasswordRecoveryNotifier
{
    Task SendResetLinkAsync(string email, string resetUrl, CancellationToken ct);
}
