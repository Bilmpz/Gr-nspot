using CheapHours.Api.Models;

namespace CheapHours.Api.Services;

public interface IPowerService
{
    Task<IReadOnlyList<HourlyPrice>> GetTodayAsync(string area, CancellationToken ct = default);
    Task<IReadOnlyList<HourlyPrice>> GetTomorrowAsync(string area, CancellationToken ct = default);
    Task<IReadOnlyList<HourlyPrice>> GetCheapestAsync(string area, int count, CancellationToken ct = default);
    Task<BestWindow> GetBestWindowAsync(string area, int durationHours, CancellationToken ct = default);
    Task<PriceSummary> GetSummaryAsync(string area, CancellationToken ct = default);
}
