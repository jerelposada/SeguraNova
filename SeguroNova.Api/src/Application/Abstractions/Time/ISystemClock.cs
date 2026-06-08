namespace Application.Abstractions.Time;

public interface ISystemClock
{
    DateTime UtcNow { get; }
}