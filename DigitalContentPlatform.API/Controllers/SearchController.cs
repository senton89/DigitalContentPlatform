using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DigitalContentPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _searchService.SearchDigitalItemsAsync(query, page, pageSize);
            return Ok(result);
        }

        [HttpPost("filter")]
        public async Task<IActionResult> Filter([FromBody] FilterParams filterParams)
        {
            var result = await _searchService.FilterDigitalItemsAsync(filterParams);
            return Ok(result);
        }
    }
}
