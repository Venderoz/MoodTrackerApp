using backend.DTOs;

namespace backend.Services.Interfaces
{
    public interface IEntriesService
    {
        Task<IEnumerable<EntryDto>> GetAllEntriesWithLabelsAsync();
        Task<EntryDto?> CreateEntryAsync(SaveEntryDto dto);
        Task<EntryDto?> UpdateEntryAsync(int id, SaveEntryDto dto);
        Task DeleteEntryAsync(int id);
        Task<ChartDataDto> GetDashboardStatsAsync();
        Task<IEnumerable<EntryDto>> GetFilteredEntriesAsync(EntryFilterDto filters);
    }
}