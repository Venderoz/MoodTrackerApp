using backend.DTOs;

namespace backend.Services.Interfaces;

public interface ILabelsService
{
    Task<IEnumerable<LabelDto>> GetLabelsForUserAsync();
    Task<LabelDto?> CreateLabelAsync(SaveLabelDto dto);
    Task<LabelDto?> UpdateLabelAsync(int id, SaveLabelDto dto);
    Task<bool> DeleteLabelAsync(int id);
}