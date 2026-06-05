using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class EntriesService : IEntriesService
    {
        private readonly AppDbContext _context;

        public EntriesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Entry>> GetAllEntriesWithLabels()
        {
            return await _context.Entries
                .Include(e => e.Labels)
                .ToListAsync();
        }

        public async Task<Entry> CreateEntry(CreateEntryDto dto)
        {
            var newEntry = new Entry
            {
                UserId = 1,
                MoodLevel = dto.MoodLevel,
                SleepDuration = dto.SleepDuration,
                Note = dto.Note
            };

            if (dto.LabelIds != null && dto.LabelIds.Any())
            {
                var selectedLabels = await _context.CustomLabels
                    .Where(label => dto.LabelIds.Contains(label.Id))
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
    }
}
