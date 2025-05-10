// DigitalContentPlatform.API/Controllers/DigitalItemsController.cs
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace DigitalContentPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DigitalItemsController : ControllerBase
    {
        private readonly IDigitalItemService _digitalItemService;

        public DigitalItemsController(IDigitalItemService digitalItemService)
        {
            _digitalItemService = digitalItemService;
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
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _digitalItemService.CreateAsync(dto, userId);

            if (!result.Success)
                return BadRequest(result.Message);

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
