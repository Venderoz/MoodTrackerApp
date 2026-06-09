using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;
public class CreateEntryDto
{
    [Range(1, 5, ErrorMessage = "Value out of range")]
    public sbyte MoodLevel { get; set; }
    public decimal? SleepDuration { get; set; }
    public string? Note { get; set; }
    public List<string> LabelNames { get; set; } = new List<string>();
}