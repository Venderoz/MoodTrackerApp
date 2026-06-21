using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;

namespace backend.Services;

public class EntriesService : IEntriesService
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public EntriesService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    private int GetCurrentUserId()
    {
        var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdStr, out int userId))
        {
            return userId;
        }
        throw new UnauthorizedAccessException("Invalid or missing user token.");
    }

    public async Task<IEnumerable<EntryDto>> GetAllEntriesWithLabelsAsync()
    {
        var userId = GetCurrentUserId();
        return await _context.Entries
            .AsNoTracking()
            .Include(e => e.Labels)
            .Where(e => e.UserId == userId)
            .Select(e => new EntryDto
            {
                Id = e.Id,
                MoodLevel = e.MoodLevel,
                SleepDuration = e.SleepDuration,
                Note = e.Note,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                Labels = e.Labels.Select(l => new LabelDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    ColorHex = l.ColorHex ?? "#a855f7"
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<EntryDto?> CreateEntryAsync(SaveEntryDto dto)
    {
        var userId = GetCurrentUserId();
        var today = DateTime.UtcNow.Date;
        var hasEntryToday = await _context.Entries
            .AnyAsync(e => e.UserId == userId && e.CreatedAt >= today);

        if (hasEntryToday) return null;

        var newEntry = new Entry
        {
            UserId = userId,
            MoodLevel = dto.MoodLevel,
            SleepDuration = dto.SleepDuration,
            Note = dto.Note
        };

        if (dto.LabelNames != null && dto.LabelNames.Any())
        {
            var selectedLabels = await _context.CustomLabels
                .Where(label => dto.LabelNames.Contains(label.Name) && label.UserId == userId)
                .ToListAsync();

            foreach (var label in selectedLabels)
            {
                newEntry.Labels.Add(label);
            }
        }

        _context.Entries.Add(newEntry);
        await _context.SaveChangesAsync();

        return new EntryDto
        {
            Id = newEntry.Id,
            MoodLevel = newEntry.MoodLevel,
            SleepDuration = newEntry.SleepDuration,
            Note = newEntry.Note,
            CreatedAt = newEntry.CreatedAt,
            UpdatedAt = newEntry.UpdatedAt,
            Labels = newEntry.Labels.Select(l => new LabelDto
            {
                Id = l.Id,
                Name = l.Name,
                ColorHex = l.ColorHex ?? "#a855f7"
            }).ToList()
        };
    }

    public async Task<EntryDto?> UpdateEntryAsync(int id, SaveEntryDto dto)
    {
        var userId = GetCurrentUserId();
        var existingEntry = await _context.Entries
            .Include(e => e.Labels)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (existingEntry == null) return null;

        existingEntry.MoodLevel = dto.MoodLevel;
        existingEntry.SleepDuration = dto.SleepDuration;
        existingEntry.Note = dto.Note;
        existingEntry.UpdatedAt = DateTime.UtcNow;

        existingEntry.Labels.Clear();

        if (dto.LabelNames != null && dto.LabelNames.Any())
        {
            var newLabels = await _context.CustomLabels
                .Where(label => dto.LabelNames.Contains(label.Name) && label.UserId == userId)
                .ToListAsync();
            foreach (var label in newLabels)
            {
                existingEntry.Labels.Add(label);
            }
        }
        await _context.SaveChangesAsync();

        return new EntryDto
        {
            Id = existingEntry.Id,
            MoodLevel = existingEntry.MoodLevel,
            SleepDuration = existingEntry.SleepDuration,
            Note = existingEntry.Note,
            CreatedAt = existingEntry.CreatedAt,
            UpdatedAt = existingEntry.UpdatedAt,
            Labels = existingEntry.Labels.Select(l => new LabelDto
            {
                Id = l.Id,
                Name = l.Name,
                ColorHex = l.ColorHex ?? "#a855f7"
            }).ToList()
        };
    }

    public async Task<ChartDataDto> GetDashboardStatsAsync()
    {
        var userId = GetCurrentUserId();
        var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-7);

        var recentEntries = await _context.Entries
            .AsNoTracking()
            .Where(e => e.CreatedAt >= sevenDaysAgo && e.UserId == userId)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync();

        var frequentMood = recentEntries.Any()
            ? recentEntries
                .GroupBy(e => e.MoodLevel)
                .OrderByDescending(g => g.Count())
                .First().Key
            : 0;

        var avgSleep = recentEntries.Any()
            ? Math.Round(recentEntries.Average(e => (double)(e.SleepDuration ?? 0)), 1)
            : 0.0;

        var sparklines = recentEntries.Select(e => new SparklineDataDto
        {
            DateStr = (e.CreatedAt ?? DateTime.UtcNow).ToString("MMM d", new CultureInfo("en-US")),
            Mood = e.MoodLevel,
            Sleep = (double)(e.SleepDuration ?? 0)
        }).ToList();

        var topTags = await _context.Entries
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .SelectMany(e => e.Labels)
            .GroupBy(l => new { l.Name, l.ColorHex })
            .Select(g => new TopTagDto
            {
                Name = g.Key.Name,
                Color = g.Key.ColorHex ?? "#a855f7",
                Value = g.Count()
            })
            .OrderByDescending(t => t.Value)
            .Take(5)
            .ToListAsync();

        return new ChartDataDto
        {
            Sparklines = sparklines,
            FrequentMood = frequentMood,
            AvgSleep = avgSleep,
            TopTags = topTags
        };
    }

    public async Task<IEnumerable<EntryDto>> GetFilteredEntriesAsync(EntryFilterDto filters)
    {
        var userId = GetCurrentUserId();
        var query = _context.Entries
            .AsNoTracking()
            .Include(e => e.Labels)
            .Where(e => e.UserId == userId)
            .AsQueryable();

        if (filters.StartDate.HasValue)
        {
            query = query.Where(e => e.CreatedAt >= filters.StartDate.Value);
        }

        if (filters.EndDate.HasValue)
        {
            var endOfDay = filters.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(e => e.CreatedAt <= endOfDay);
        }

        // ZMIANA: Logika AND dla etykiet
        if (filters.LabelNames != null && filters.LabelNames.Any())
        {
            // Przechodzimy przez każdą wybraną etykietę i nakładamy osobny warunek.
            // Entity Framework połączy je operatorem AND w zapytaniu SQL.
            foreach (var labelName in filters.LabelNames)
            {
                query = query.Where(e => e.Labels.Any(l => l.Name == labelName));
            }
        }

        return await query
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EntryDto
            {
                Id = e.Id,
                MoodLevel = e.MoodLevel,
                SleepDuration = e.SleepDuration,
                Note = e.Note,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                Labels = e.Labels.Select(l => new LabelDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    ColorHex = l.ColorHex ?? "#a855f7"
                }).ToList()
            })
            .ToListAsync();
    }
}