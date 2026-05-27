using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class MoodEntry
{
    public int Id { get; set; }

    public int MoodLevel { get; set; }

    public string? Note { get; set; }

    public DateTime? CreatedAt { get; set; }
}
