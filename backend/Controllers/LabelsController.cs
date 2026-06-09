using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LabelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LabelsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetLabels()
        {
            var labels = await _context.CustomLabels
                .Where(l => l.UserId == 1)
                .ToListAsync();

            return Ok(labels);
        }
    }
}