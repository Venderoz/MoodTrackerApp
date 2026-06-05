namespace backend.Models;

public partial class UserProfile
{
    public int Id { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public virtual User IdNavigation { get; set; } = null!;
}
