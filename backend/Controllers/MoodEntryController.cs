using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoodEntryController : ControllerBase
{
    private readonly AppDbContext _context;

    public MoodEntryController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var moods = await _context.MoodEntries.ToListAsync();
        return Ok(moods);
    }


    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateMoodEntryDto dto)
    {
        
        var newMoodEntry = new MoodEntry
        {
            // TODO: zmienić na pobieranie ID z tokenu JWT lub sesji, gdy dodamy logowanie
            // obecnie sztywno przypisujemy wszystko do domyślnego użytkownika z pliku init.sql z user_id=1
            UserId = 1,
            MoodLevel = dto.MoodLevel,
            Note = dto.Note,
            SleepDuration = dto.SleepDuration
        };

        _context.MoodEntries.Add(newMoodEntry);
        await _context.SaveChangesAsync();
        
        return Ok(newMoodEntry);
    }
}