using backend.DTOs;

namespace backend.Services;

public interface IProfileService
{
    Task<UserProfileDto?> GetProfileAsync();
    Task<UserProfileDto?> UpdateProfileAsync(UpdateProfileDto dto);
}