using backend.Models;

namespace backend.Services
{
    public interface ILabelsService
    {
        Task<IEnumerable<CustomLabel>> GetLabelsForUserAsync();
    }
}