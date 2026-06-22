using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class LabelsController : ControllerBase
{
    private readonly ILabelsService _labelsService;

    public LabelsController(ILabelsService labelsService)
    {
        _labelsService = labelsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLabels()
    {
        var labels = await _labelsService.GetLabelsForUserAsync();
        return Ok(labels);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLabel(SaveLabelDto dto)
    {
        var newLabel = await _labelsService.CreateLabelAsync(dto);
        if (newLabel == null)
            return BadRequest(new { message = "Label with this name already exists." });

        return Ok(newLabel);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLabel(int id, SaveLabelDto dto)
    {
        var updatedLabel = await _labelsService.UpdateLabelAsync(id, dto);
        if (updatedLabel == null)
            return BadRequest(new { message = "Update failed. Label not found or name already in use." });

        return Ok(updatedLabel);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLabel(int id)
    {
        var success = await _labelsService.DeleteLabelAsync(id);
        if (!success)
            return NotFound(new { message = "Label not found." });

        return NoContent();
    }
}