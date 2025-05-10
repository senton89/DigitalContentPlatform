using DigitalContentPlatform.Core.DTOs.Admin;
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;
        private readonly IDigitalItemService _digitalItemService;
        private readonly IAnalyticsService _analyticsService;

        public AdminController(
            IUserManagementService userManagementService,
            IDigitalItemService digitalItemService,
            IAnalyticsService analyticsService)
        {
            _userManagementService = userManagementService;
            _digitalItemService = digitalItemService;
            _analyticsService = analyticsService;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _userManagementService.GetAllUsersAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _userManagementService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateRoleDto dto)
        {
            var result = await _userManagementService.UpdateUserRoleAsync(id, dto.Role);
            if (!result)
                return BadRequest("Failed to update user role");

            return Ok();
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _userManagementService.DeleteUserAsync(id);
            if (!result)
                return BadRequest("Failed to delete user");

            return NoContent();
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var result = await _analyticsService.GetDashboardStatsAsync();
            return Ok(result);
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetAllItems([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _digitalItemService.GetAllAsync(page, pageSize);
            return Ok(result);
        }

        [HttpDelete("items/{id}")]
        public async Task<IActionResult> DeleteItem(Guid id)
        {
            // Администратор может удалять любой контент
            var result = await _digitalItemService.AdminDeleteAsync(id);
            if (!result.Success)
                return BadRequest(result.Message);

            return NoContent();
        }
    }
}