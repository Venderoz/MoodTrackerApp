using backend.DTOs;

namespace backend.Services.Interfaces;

public interface IProfileService
{
    Task<UserProfileDto?> GetProfileAsync();
    Task<UserProfileDto?> UpdateProfileAsync(UpdateProfileDto dto);
}