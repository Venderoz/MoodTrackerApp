using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IEntriesService
    {
        Task<IEnumerable<EntryDto>> GetAllEntriesWithLabelsAsync();
        Task<EntryDto?> CreateEntryAsync(SaveEntryDto dto);
        Task<EntryDto?> UpdateEntryAsync(int id, SaveEntryDto dto);
        Task<ChartDataDto> GetDashboardStatsAsync();
        Task<IEnumerable<EntryDto>> GetFilteredEntriesAsync(EntryFilterDto filters);
    }
}