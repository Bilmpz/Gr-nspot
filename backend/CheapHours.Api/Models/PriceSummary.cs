namespace CheapHours.Api.Models;

/// <summary>
/// Aggregated price statistics for a day.
/// </summary>
public record PriceSummary(
    decimal MinPriceKrPerKwh,
    decimal MaxPriceKrPerKwh,
    decimal AveragePriceKrPerKwh,
    HourlyPrice CheapestHour,
    HourlyPrice MostExpensiveHour,
    int HoursBelowAverage,
    string PriceArea,
    string Date
);
