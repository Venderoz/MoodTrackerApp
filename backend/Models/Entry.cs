namespace backend.Models;

public partial class Entry
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public sbyte MoodLevel { get; set; }

    public decimal? SleepDuration { get; set; }

    public string? Note { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<CustomLabel> Labels { get; set; } = new List<CustomLabel>();
}
