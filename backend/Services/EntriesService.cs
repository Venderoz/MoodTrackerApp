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

            if (dto.LabelNames != null && dto.LabelNames.Any())
            {
                var selectedLabels = await _context.CustomLabels
                    .Where(label => dto.LabelNames.Contains(label.Name))
                    .ToListAsync();

                foreach (var label in selectedLabels)
                {
                    newEntry.Labels.Add(label);
                }
            }
            try
            {
                _context.Entries.Add(newEntry);
                await _context.SaveChangesAsync();
                return newEntry;
            }
            catch (DbUpdateException ex)
                when (ex.InnerException != null && ex.InnerException.Message.Contains("Double entry error"))
            {
                throw new InvalidOperationException("Entry was already added today!");
            }
        }

        public async Task<Entry?> UpdateEntry(int id, CreateEntryDto dto)
        {
            var existingEntry = await _context.Entries
                .Include(e => e.Labels)
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == 1);

            if (existingEntry == null) return null;

            existingEntry.MoodLevel = dto.MoodLevel;
            existingEntry.SleepDuration = dto.SleepDuration;
            existingEntry.Note = dto.Note;
            existingEntry.UpdatedAt = DateTime.UtcNow;

            existingEntry.Labels.Clear();

            if (dto.LabelNames != null && dto.LabelNames.Any())
            {
                var newLabels = await _context.CustomLabels
                    .Where(label => dto.LabelNames.Contains(label.Name) && label.UserId == 1)
                    .ToListAsync();
                foreach (var label in newLabels)
                {
                    existingEntry.Labels.Add(label);
                }
            }
            await _context.SaveChangesAsync();
            return existingEntry;
        }
    }
}
