using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services
{
    public class LabelsService : ILabelsService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LabelsService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
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

        public async Task<IEnumerable<CustomLabel>> GetLabelsForUserAsync()
        {
            var userId = GetCurrentUserId();
            return await _context.CustomLabels
                .AsNoTracking()
                .Where(l => l.UserId == userId)
                .ToListAsync();
        }
    }
}