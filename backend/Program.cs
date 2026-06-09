using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddCors(options => 
    options.AddDefaultPolicy(policy => 
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    }));

builder.Services.AddScoped<IEntriesService, EntriesService>();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();
int maxRetries = 5;
int delayMs = 2000;

for (int i = 0; i < maxRetries; i++)
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.EnsureCreatedAsync();
            Console.WriteLine("Database initialized successfully");
            break;
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization attempt {i + 1}/{maxRetries} failed: {ex.Message}");
        if (i < maxRetries - 1)
        {
            await Task.Delay(delayMs);
        }
    }
}

app.UseCors();
app.MapControllers();

app.Run();