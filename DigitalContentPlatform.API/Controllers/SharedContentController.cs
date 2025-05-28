using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace DigitalContentPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SharedContentController : ControllerBase
    {
        private readonly ISharedContentService _contentService;
        private readonly IFileService _fileService;

        public SharedContentController(ISharedContentService contentService, IFileService fileService)
        {
            _contentService = contentService;
            _fileService = fileService;
        }
        
        [HttpGet] 
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10) {
            var items = await _contentService.GetAllAsync(page, pageSize);
            return Ok(items);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] CreateSharedContentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string fileUrl = null;

            if (dto.File != null && dto.File.Length > 0)
            {
                try
                {
                    fileUrl = await _fileService.SaveFileAsync(dto.File, "shared_content");
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { message = "Ошибка загрузки файла", error = ex.Message });
                }
            }

            var id = await _contentService.CreateAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id }, new { id, url = fileUrl });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _contentService.GetByIdAsync(id);
            if (item == null)
                return NotFound();

            return Ok(item);
        }
    }
}