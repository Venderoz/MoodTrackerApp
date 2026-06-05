using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;
public class CreateEntryDto
{
    [Range(0, 5, ErrorMessage = "Value out of range")]
    public sbyte MoodLevel { get; set; }
    public decimal? SleepDuration { get; set; }
    public string? Note { get; set; }
    public List<int> LabelIds { get; set; } = new List<int>();
}