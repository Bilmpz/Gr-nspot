namespace CheapHours.Api.Clients;

public interface IElspotClient
{
    Task<IReadOnlyList<ElspotRecord>> GetPricesAsync(DateOnly date, string area, CancellationToken ct = default);
}

// Mapped from the DayAheadPrices dataset — TimeDK and DayAheadPriceDKK
public record ElspotRecord(string HourDK, decimal SpotPriceDKK, string PriceArea);
