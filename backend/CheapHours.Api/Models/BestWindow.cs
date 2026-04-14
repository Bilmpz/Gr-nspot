namespace CheapHours.Api.Models;

/// <summary>
/// Represents the cheapest contiguous block of hours.
/// </summary>
public record BestWindow(
    string StartHour,
    string EndHour,
    int DurationHours,
    decimal AveragePriceKrPerKwh,
    IReadOnlyList<HourlyPrice> Hours
);
