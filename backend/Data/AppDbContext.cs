using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace backend.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CustomLabel> CustomLabels { get; set; }

    public virtual DbSet<Entry> Entries { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_unicode_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<CustomLabel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("custom_labels");

            entity.HasIndex(e => new { e.UserId, e.Name }, "uq_user_label").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.ColorHex)
                .HasMaxLength(7)
                .HasColumnName("color_hex");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
            entity.Property(e => e.UserId)
                .HasColumnType("int(11)")
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.CustomLabels)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_custom_labels_users");
        });
        modelBuilder
            .UseCollation("utf8mb4_unicode_ci")
            .HasCharSet("utf8mb4");

        // --- DODANY KONWERTER UTC ---
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (entityType.IsKeyless) continue;

            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                    property.SetValueConverter(dateTimeConverter);
                else if (property.ClrType == typeof(DateTime?))
                    property.SetValueConverter(nullableDateTimeConverter);
            }
        }

        modelBuilder.Entity<Entry>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("entries");

            entity.HasIndex(e => e.UserId, "fk_entries_users");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.MoodLevel)
                .HasColumnType("tinyint(4)")
                .HasColumnName("mood_level");
            entity.Property(e => e.Note)
                .HasColumnType("text")
                .HasColumnName("note");
            entity.Property(e => e.SleepDuration)
                .HasPrecision(4, 2)
                .HasColumnName("sleep_duration");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId)
                .HasColumnType("int(11)")
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Entries)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_entries_users");

            entity.HasMany(d => d.Labels).WithMany(p => p.Entries)
                .UsingEntity<Dictionary<string, object>>(
                    "EntryLabel",
                    r => r.HasOne<CustomLabel>().WithMany()
                        .HasForeignKey("LabelId")
                        .HasConstraintName("fk_entry_labels_custom_labels"),
                    l => l.HasOne<Entry>().WithMany()
                        .HasForeignKey("EntryId")
                        .HasConstraintName("fk_entry_labels_entries"),
                    j =>
                    {
                        j.HasKey("EntryId", "LabelId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("entry_labels");
                        j.HasIndex(new[] { "LabelId" }, "fk_entry_labels_custom_labels");
                        j.IndexerProperty<int>("EntryId")
                            .HasColumnType("int(11)")
                            .HasColumnName("entry_id");
                        j.IndexerProperty<int>("LabelId")
                            .HasColumnType("int(11)")
                            .HasColumnName("label_id");
                    });
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "email").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user_profiles");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.BirthDate).HasColumnName("birth_date");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasColumnName("last_name");

            entity.HasOne(d => d.IdNavigation).WithOne(p => p.UserProfile)
                .HasForeignKey<UserProfile>(d => d.Id)
                .HasConstraintName("fk_user_profiles_users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
