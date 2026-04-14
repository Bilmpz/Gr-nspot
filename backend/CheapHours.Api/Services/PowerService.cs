using CheapHours.Api.Clients;
using CheapHours.Api.Models;
using Microsoft.Extensions.Caching.Memory;

namespace CheapHours.Api.Services;

public class PowerService : IPowerService
{
    private readonly IElspotClient _client;
    private readonly IMemoryCache _cache;
    private readonly ILogger<PowerService> _logger;

    public PowerService(IElspotClient client, IMemoryCache cache, ILogger<PowerService> logger)
    {
        _client = client;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IReadOnlyList<HourlyPrice>> GetTodayAsync(string area, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        return await FetchAndCacheAsync(today, area, TimeSpan.FromMinutes(30), ct);
    }

    public async Task<IReadOnlyList<HourlyPrice>> GetTomorrowAsync(string area, CancellationToken ct = default)
    {
        var tomorrow = DateOnly.FromDateTime(DateTime.Now.AddDays(1));
        var prices = await FetchAndCacheAsync(tomorrow, area, TimeSpan.FromMinutes(60), ct);
        if (prices.Count == 0)
            throw new TomorrowNotAvailableException("Tomorrow's prices are not yet published. They are usually available after 13:00 CET.");
        return prices;
    }

    public async Task<IReadOnlyList<HourlyPrice>> GetCheapestAsync(string area, int count, CancellationToken ct = default)
    {
        var prices = await GetTodayAsync(area, ct);
        return [.. prices.OrderBy(p => p.PriceKrPerKwh).Take(count)];
    }

    public async Task<BestWindow> GetBestWindowAsync(string area, int durationHours, CancellationToken ct = default)
    {
        var prices = await GetTodayAsync(area, ct);
        var list = prices.ToList();

        if (durationHours > list.Count)
            durationHours = list.Count;

        // Sliding window: find the window with lowest total price
        decimal minSum = decimal.MaxValue;
        int bestStart = 0;

        decimal windowSum = list.Take(durationHours).Sum(p => p.PriceKrPerKwh);
        minSum = windowSum;

        for (int i = 1; i <= list.Count - durationHours; i++)
        {
            windowSum = windowSum - list[i - 1].PriceKrPerKwh + list[i + durationHours - 1].PriceKrPerKwh;
            if (windowSum < minSum)
            {
                minSum = windowSum;
                bestStart = i;
            }
        }

        var windowHours = list.GetRange(bestStart, durationHours);
        var avg = windowHours.Average(p => p.PriceKrPerKwh);

        return new BestWindow(
            StartHour: windowHours.First().HourDK,
            EndHour: windowHours.Last().HourDK,
            DurationHours: durationHours,
            AveragePriceKrPerKwh: Math.Round(avg, 4),
            Hours: windowHours
        );
    }

    public async Task<PriceSummary> GetSummaryAsync(string area, CancellationToken ct = default)
    {
        var prices = await GetTodayAsync(area, ct);
        var avg = prices.Average(p => p.PriceKrPerKwh);

        return new PriceSummary(
            MinPriceKrPerKwh: prices.Min(p => p.PriceKrPerKwh),
            MaxPriceKrPerKwh: prices.Max(p => p.PriceKrPerKwh),
            AveragePriceKrPerKwh: Math.Round(avg, 4),
            CheapestHour: prices.MinBy(p => p.PriceKrPerKwh)!,
            MostExpensiveHour: prices.MaxBy(p => p.PriceKrPerKwh)!,
            HoursBelowAverage: prices.Count(p => p.PriceKrPerKwh < avg),
            PriceArea: area,
            Date: DateOnly.FromDateTime(DateTime.Now).ToString("yyyy-MM-dd")
        );
    }

    private async Task<IReadOnlyList<HourlyPrice>> FetchAndCacheAsync(
        DateOnly date, string area, TimeSpan duration, CancellationToken ct)
    {
        var key = $"prices_{area}_{date:yyyy-MM-dd}";

        if (_cache.TryGetValue(key, out IReadOnlyList<HourlyPrice>? cached) && cached is not null)
        {
            _logger.LogInformation("Cache hit for {Key}", key);
            return cached;
        }

        var records = await _client.GetPricesAsync(date, area, ct);
        var prices = records
            .Select(r => new HourlyPrice(
                HourDK: r.HourDK,
                PriceKrPerKwh: Math.Round(r.SpotPriceDKK / 1000m, 4),
                PriceArea: r.PriceArea
            ))
            .ToList();

        _cache.Set(key, (IReadOnlyList<HourlyPrice>)prices, duration);
        return prices;
    }
}

public class TomorrowNotAvailableException : Exception
{
    public TomorrowNotAvailableException(string message) : base(message) { }
}
