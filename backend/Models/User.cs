namespace backend.Models;

public partial class User
{
    public int Id { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<CustomLabel> CustomLabels { get; set; } = new List<CustomLabel>();

    public virtual ICollection<Entry> Entries { get; set; } = new List<Entry>();

    public virtual UserProfile? UserProfile { get; set; }
}
