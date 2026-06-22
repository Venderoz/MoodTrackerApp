using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services;

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

    public async Task<IEnumerable<LabelDto>> GetLabelsForUserAsync()
    {
        var userId = GetCurrentUserId();

        return await _context.CustomLabels
            .AsNoTracking()
            .Where(l => l.UserId == userId)
            .Select(l => new LabelDto
            {
                Id = l.Id,
                Name = l.Name,
                ColorHex = l.ColorHex ?? "#a855f7"
            })
            .ToListAsync();
    }

    public async Task<LabelDto?> CreateLabelAsync(SaveLabelDto dto)
    {
        var userId = GetCurrentUserId();

        var exists = await _context.CustomLabels
            .AnyAsync(l => l.UserId == userId && l.Name.ToLower() == dto.Name.ToLower());

        if (exists) return null;

        var newLabel = new CustomLabel
        {
            UserId = userId,
            Name = dto.Name,
            ColorHex = dto.ColorHex
        };

        _context.CustomLabels.Add(newLabel);
        await _context.SaveChangesAsync();

        return new LabelDto
        {
            Id = newLabel.Id,
            Name = newLabel.Name,
            ColorHex = newLabel.ColorHex
        };
    }

    public async Task<LabelDto?> UpdateLabelAsync(int id, SaveLabelDto dto)
    {
        var userId = GetCurrentUserId();
        var label = await _context.CustomLabels.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (label == null) return null;

        var nameTaken = await _context.CustomLabels
            .AnyAsync(l => l.UserId == userId && l.Name.ToLower() == dto.Name.ToLower() && l.Id != id);

        if (nameTaken) return null;

        label.Name = dto.Name;
        label.ColorHex = dto.ColorHex;

        await _context.SaveChangesAsync();

        return new LabelDto
        {
            Id = label.Id,
            Name = label.Name,
            ColorHex = label.ColorHex
        };
    }

    public async Task<bool> DeleteLabelAsync(int id)
    {
        var userId = GetCurrentUserId();
        var label = await _context.CustomLabels.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (label == null) return false;

        _context.CustomLabels.Remove(label);
        await _context.SaveChangesAsync();
        return true;
    }
}