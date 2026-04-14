using System.Text.Json;
using System.Text.Json.Serialization;

namespace CheapHours.Api.Clients;

public class ElspotClient : IElspotClient
{
    private readonly HttpClient _http;
    private readonly ILogger<ElspotClient> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public ElspotClient(HttpClient http, ILogger<ElspotClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<IReadOnlyList<ElspotRecord>> GetPricesAsync(DateOnly date, string area, CancellationToken ct = default)
    {
        var dateStr = date.ToString("yyyy-MM-dd");
        var filter = Uri.EscapeDataString($"{{\"PriceArea\":\"{area}\"}}");
        // DayAheadPrices replaced Elspotprices after 2025-09-30. It returns 15-min intervals;
        // we fetch all 96 and keep only the top-of-hour records (minute == 0).
        var url = $"dataset/DayAheadPrices?start={dateStr}T00:00&end={dateStr}T23:59&filter={filter}&limit=200";

        _logger.LogInformation("Fetching DayAheadPrices for {Date} {Area}", dateStr, area);

        HttpResponseMessage response;
        try
        {
            response = await _http.GetAsync(url, ct);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error fetching DayAheadPrices");
            throw new ElspotUnavailableException("Upstream Energi Data Service is unavailable.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Energi Data Service returned {StatusCode}", response.StatusCode);
            throw new ElspotUnavailableException($"Upstream returned {response.StatusCode}");
        }

        var body = await response.Content.ReadAsStringAsync(ct);
        var result = JsonSerializer.Deserialize<DayAheadResponse>(body, JsonOptions);

        // Keep only top-of-hour records and map to the shared ElspotRecord shape
        var hourly = (result?.Records ?? [])
            .Where(r => DateTime.TryParse(r.TimeDK, out var dt) && dt.Minute == 0)
            .OrderBy(r => r.TimeDK)
            .Select(r => new ElspotRecord(r.TimeDK, r.DayAheadPriceDKK, r.PriceArea))
            .ToList();

        return hourly;
    }

    private record DayAheadRecord(
        string TimeDK,
        decimal DayAheadPriceDKK,
        string PriceArea
    );

    private record DayAheadResponse(
        [property: JsonPropertyName("records")] List<DayAheadRecord> Records
    );
}

public class ElspotUnavailableException : Exception
{
    public ElspotUnavailableException(string message, Exception? inner = null) : base(message, inner) { }
}
