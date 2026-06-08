using Application.Abstractions.Notifications;

namespace Infrastructure.Notifications;

public sealed class LoggingPasswordRecoveryNotifier : IPasswordRecoveryNotifier
{
    public Task SendResetLinkAsync(string email, string resetUrl, CancellationToken ct)
    {
        Console.WriteLine($"Password recovery link generated for {email}. Link: {resetUrl}");
        return Task.CompletedTask;
    }
}
