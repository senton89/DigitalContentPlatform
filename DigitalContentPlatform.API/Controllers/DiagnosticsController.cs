using DigitalContentPlatform.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalContentPlatform.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticsController : ControllerBase
    {
        private readonly QueryProfilerService _queryProfilerService;

        public DiagnosticsController(QueryProfilerService queryProfilerService)
        {
            _queryProfilerService = queryProfilerService;
        }

        [HttpGet("query-stats")]
        public IActionResult GetQueryStats()
        {
            var stats = _queryProfilerService.GetQueryStats();
            return Ok(stats);
        }

        [HttpPost("clear-stats")]
        public IActionResult ClearStats()
        {
            _queryProfilerService.ClearStats();
            return Ok();
        }
    }
}
