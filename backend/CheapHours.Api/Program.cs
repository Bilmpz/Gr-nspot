using CheapHours.Api.Clients;
using CheapHours.Api.Middleware;
using CheapHours.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CheapHours API", Version = "v1", Description = "Danish electricity spot price API" });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// Memory cache
builder.Services.AddMemoryCache();

// Typed HTTP client for Energi Data Service
builder.Services.AddHttpClient<IElspotClient, ElspotClient>(client =>
{
    client.BaseAddress = new Uri("https://api.energidataservice.dk/");
    client.Timeout = TimeSpan.FromSeconds(15);
});

// Services
builder.Services.AddScoped<IPowerService, PowerService>();

// CORS — allow all in development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

app.Run();
