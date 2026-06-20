using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class UserProfileDto
{
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? BirthDate { get; set; }
}

public class UpdateProfileDto
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "First name is required.")]
    [MinLength(2, ErrorMessage = "First name must be at least 2 characters long.")]
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }
    public string? BirthDate { get; set; }
}