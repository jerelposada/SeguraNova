namespace Repository.Authentication;

public interface ISystemClock
{
    DateTime UtcNow { get; }
}
