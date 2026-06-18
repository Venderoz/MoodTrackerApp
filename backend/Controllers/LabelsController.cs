using Microsoft.AspNetCore.Mvc;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

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
}