// DigitalContentPlatform.API/Controllers/DigitalItemsController.cs
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.Entities;

namespace DigitalContentPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DigitalItemsController : ControllerBase
    {
        private readonly IDigitalItemService _digitalItemService;
        private IFileService _fileStorageService;

        public DigitalItemsController(IDigitalItemService digitalItemService,IFileService fileStorageService)
        {
            _digitalItemService = digitalItemService;
            _fileStorageService = fileStorageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var result = await _digitalItemService.GetAllAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _digitalItemService.GetByIdAsync(id);
            if (item == null)
                return NotFound();

            return Ok(item);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(Guid categoryId, int page = 1, int pageSize = 10)
        {
            var result = await _digitalItemService.GetByCategoryAsync(categoryId, page, pageSize);
            return Ok(result);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetByUser(int page = 1, int pageSize = 10)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _digitalItemService.GetByUserAsync(userId, page, pageSize);
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] DigitalItemCreateDto dto)
        {
            string imageUrl = null;

            if (dto.Thumbnail != null)
            {
                // Загружаем файл напрямую в Cloudinary без сохранения на диск
                using var memoryStream = new MemoryStream();
                await dto.Thumbnail.CopyToAsync(memoryStream);
        
                // Используем имя файла из DTO
                var fileName = Path.GetFileNameWithoutExtension(dto.Thumbnail.FileName) + "_" + Guid.NewGuid();

                // Загружаем в Cloudinary
                imageUrl = await _fileStorageService.SaveFileAsync( dto.File, "thumbnails");

                // Проверяем, что URL не null
                if (string.IsNullOrEmpty(imageUrl))
                    return StatusCode(500, new { message = "Не удалось загрузить изображение" });
            }

            // Передаём DTO и URL из Cloudinary в сервис
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _digitalItemService.CreateAsync(dto, userId, imageUrl);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromForm] DigitalItemUpdateDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _digitalItemService.UpdateAsync(id, dto, userId);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _digitalItemService.DeleteAsync(id, userId);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result);
        }
    }
}
