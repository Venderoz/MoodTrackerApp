using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class LabelsService : ILabelsService
    {
        private readonly AppDbContext _context;

        public LabelsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CustomLabel>> GetLabelsForUserAsync()
        {
            return await _context.CustomLabels
                .AsNoTracking()
                .Where(l => l.UserId == 1)
                .ToListAsync();
        }
    }
}