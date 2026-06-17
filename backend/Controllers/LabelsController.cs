using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
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
}