using backend.DTOs;
using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EntriesController : ControllerBase
{
    private readonly IEntriesService _entriesService;

    public EntriesController(IEntriesService entriesService)
    {
        _entriesService = entriesService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var entries = await _entriesService.GetAllEntriesWithLabels();
        return Ok(entries);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateEntryDto dto)
    {
        var createdEntry = await _entriesService.CreateEntry(dto);
        return Ok(createdEntry);
    }
}