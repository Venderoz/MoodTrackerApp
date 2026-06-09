using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IEntriesService
    {
        Task<IEnumerable<Entry>> GetAllEntriesWithLabels();
        Task<Entry> CreateEntry(CreateEntryDto dto);
        Task<Entry?> UpdateEntry(int id, CreateEntryDto dto);
    }
}
