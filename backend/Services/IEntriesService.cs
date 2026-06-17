using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IEntriesService
    {
        Task<IEnumerable<Entry>> GetAllEntriesWithLabelsAsync();
        Task<Entry> CreateEntryAsync(CreateEntryDto dto);
        Task<Entry?> UpdateEntryAsync(int id, CreateEntryDto dto);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<IEnumerable<Entry>> GetFilteredEntriesAsync(EntryFilterDto filters);
    }
}