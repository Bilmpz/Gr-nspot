using System.Net;
using System.Text.Json;
using CheapHours.Api.Clients;
using CheapHours.Api.Services;

namespace CheapHours.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            if (ex is TomorrowNotAvailableException)
                _logger.LogWarning(ex.Message);
            else
                _logger.LogError(ex, "Unhandled exception");

            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            TomorrowNotAvailableException e => (HttpStatusCode.NotFound, e.Message),
            ElspotUnavailableException e => (HttpStatusCode.ServiceUnavailable, e.Message),
            ArgumentException e => (HttpStatusCode.BadRequest, e.Message),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var body = JsonSerializer.Serialize(new
        {
            message,
            timestamp = DateTime.UtcNow
        });

        return context.Response.WriteAsync(body);
    }
}
