using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProfileService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
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

    public async Task<UserProfileDto?> GetProfileAsync()
    {
        var userId = GetCurrentUserId();

        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.UserProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new UserProfileDto
        {
            Email = user.Email,
            FirstName = user.UserProfile?.FirstName,
            LastName = user.UserProfile?.LastName,
            BirthDate = user.UserProfile?.BirthDate?.ToString("yyyy-MM-dd")
        };
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(UpdateProfileDto dto)
    {
        var userId = GetCurrentUserId();

        var user = await _context.Users
            .Include(u => u.UserProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        var emailTaken = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower() && u.Id != userId);

        if (emailTaken) return null;

        user.Email = dto.Email;

        if (user.UserProfile == null)
        {
            user.UserProfile = new UserProfile();
        }

        user.UserProfile.FirstName = dto.FirstName;
        user.UserProfile.LastName = dto.LastName;

        if (!string.IsNullOrEmpty(dto.BirthDate) && DateOnly.TryParse(dto.BirthDate, out var parsedDate))
        {
            user.UserProfile.BirthDate = parsedDate;
        }
        else
        {
            user.UserProfile.BirthDate = null;
        }

        await _context.SaveChangesAsync();

        return new UserProfileDto
        {
            Email = user.Email,
            FirstName = user.UserProfile.FirstName,
            LastName = user.UserProfile.LastName,
            BirthDate = user.UserProfile.BirthDate?.ToString("yyyy-MM-dd")
        };
    }
}