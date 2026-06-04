namespace backend.Models;

public class CreateMoodEntryDto
{
    public int MoodLevel { get; set; }
    public string? Note { get; set; }
    public decimal? SleepDuration { get; set; }
}