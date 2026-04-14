using CheapHours.Api.Models;
using CheapHours.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CheapHours.Api.Controllers;

/// <summary>
/// Endpoints for Danish electricity spot prices.
/// </summary>
[ApiController]
[Route("api/power")]
[Produces("application/json")]
public class PowerController : ControllerBase
{
    private readonly IPowerService _service;

    public PowerController(IPowerService service)
    {
        _service = service;
    }

    private static bool IsValidArea(string area) =>
        area == "DK1" || area == "DK2";

    /// <summary>
    /// Returns all 24 hourly prices for today.
    /// </summary>
    /// <param name="area">Price area: DK1 or DK2</param>
    [HttpGet("today")]
    [ProducesResponseType(typeof(IReadOnlyList<HourlyPrice>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetToday([FromQuery] string area = "DK1", CancellationToken ct = default)
    {
        if (!IsValidArea(area))
            return BadRequest(new { message = "area must be DK1 or DK2" });

        var prices = await _service.GetTodayAsync(area, ct);
        return Ok(prices);
    }

    /// <summary>
    /// Returns all 24 hourly prices for tomorrow (if published).
    /// </summary>
    /// <param name="area">Price area: DK1 or DK2</param>
    [HttpGet("tomorrow")]
    [ProducesResponseType(typeof(IReadOnlyList<HourlyPrice>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTomorrow([FromQuery] string area = "DK1", CancellationToken ct = default)
    {
        if (!IsValidArea(area))
            return BadRequest(new { message = "area must be DK1 or DK2" });

        var prices = await _service.GetTomorrowAsync(area, ct);
        return Ok(prices);
    }

    /// <summary>
    /// Returns the N cheapest individual hours, sorted ascending by price.
    /// </summary>
    /// <param name="area">Price area: DK1 or DK2</param>
    /// <param name="count">Number of hours (1–24)</param>
    [HttpGet("cheapest")]
    [ProducesResponseType(typeof(IReadOnlyList<HourlyPrice>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetCheapest(
        [FromQuery] string area = "DK1",
        [FromQuery] int count = 5,
        CancellationToken ct = default)
    {
        if (!IsValidArea(area))
            return BadRequest(new { message = "area must be DK1 or DK2" });
        if (count < 1 || count > 24)
            return BadRequest(new { message = "count must be between 1 and 24" });

        var prices = await _service.GetCheapestAsync(area, count, ct);
        return Ok(prices);
    }

    /// <summary>
    /// Returns the cheapest contiguous block of N hours using a sliding window.
    /// </summary>
    /// <param name="area">Price area: DK1 or DK2</param>
    /// <param name="durationHours">Window size in hours (1–24)</param>
    [HttpGet("best-window")]
    [ProducesResponseType(typeof(BestWindow), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetBestWindow(
        [FromQuery] string area = "DK1",
        [FromQuery] int durationHours = 3,
        CancellationToken ct = default)
    {
        if (!IsValidArea(area))
            return BadRequest(new { message = "area must be DK1 or DK2" });
        if (durationHours < 1 || durationHours > 24)
            return BadRequest(new { message = "durationHours must be between 1 and 24" });

        var window = await _service.GetBestWindowAsync(area, durationHours, ct);
        return Ok(window);
    }

    /// <summary>
    /// Returns price statistics: min, max, average, cheapest/most expensive hour, and hours below average.
    /// </summary>
    /// <param name="area">Price area: DK1 or DK2</param>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(PriceSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetSummary([FromQuery] string area = "DK1", CancellationToken ct = default)
    {
        if (!IsValidArea(area))
            return BadRequest(new { message = "area must be DK1 or DK2" });

        var summary = await _service.GetSummaryAsync(area, ct);
        return Ok(summary);
    }
}
