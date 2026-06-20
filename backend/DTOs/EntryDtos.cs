using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class EntryDto
{
    public int Id { get; set; }
    public sbyte MoodLevel { get; set; }
    public decimal? SleepDuration { get; set; }
    public string? Note { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<LabelDto> Labels { get; set; } = new();
}

public class SaveEntryDto
{
    [Range(1, 5, ErrorMessage = "Value out of range")]
    public sbyte MoodLevel { get; set; }
    public decimal? SleepDuration { get; set; }
    public string? Note { get; set; }
    public List<string> LabelNames { get; set; } = new();
}