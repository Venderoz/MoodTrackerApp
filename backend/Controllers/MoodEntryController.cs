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
    public async Task<IActionResult> Post([FromBody] MoodEntry newMoodEntry)
    {
        _context.MoodEntries.Add(newMoodEntry);
        await _context.SaveChangesAsync();
        return Ok(newMoodEntry);
    }
}
