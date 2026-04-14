namespace CheapHours.Api.Models;

/// <summary>
/// Represents a single hour's electricity spot price.
/// </summary>
public record HourlyPrice(
    string HourDK,
    decimal PriceKrPerKwh,
    string PriceArea
);
