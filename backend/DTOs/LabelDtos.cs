using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class LabelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;
}

public class SaveLabelDto
{
    [Required(ErrorMessage = "Label name is required.")]
    [MaxLength(30, ErrorMessage = "Label name cannot exceed 30 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Color hex is required.")]
    [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid Hex Color format.")]
    public string ColorHex { get; set; } = "#a855f7";
}