using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;

namespace backend.Services
{
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

        public async Task<IEnumerable<Entry>> GetAllEntriesWithLabelsAsync()
        {
            var userId = GetCurrentUserId();
            return await _context.Entries
                .AsNoTracking()
                .Include(e => e.Labels)
                .Where(e => e.UserId == userId)
                .ToListAsync();
        }

        public async Task<Entry?> CreateEntryAsync(CreateEntryDto dto)
        {
            var userId = GetCurrentUserId();
            var today = DateTime.UtcNow.Date;
            var hasEntryToday = await _context.Entries
                .AnyAsync(e => e.UserId == userId && e.CreatedAt >= today);

            if (hasEntryToday)
            {
                return null;
            }

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
            return newEntry;
        }

        public async Task<Entry?> UpdateEntryAsync(int id, CreateEntryDto dto)
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
            return existingEntry;
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

        public async Task<IEnumerable<Entry>> GetFilteredEntriesAsync(EntryFilterDto filters)
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
                query = query.Where(e => e.CreatedAt <= filters.EndDate.Value);
            }

            if (filters.LabelNames != null && filters.LabelNames.Any())
            {
                query = query.Where(e => e.Labels.Any(l => filters.LabelNames.Contains(l.Name)));
            }

            return await query
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }
    }
}