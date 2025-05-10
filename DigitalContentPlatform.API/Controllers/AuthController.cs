using DigitalContentPlatform.Core.DTOs.Auth;
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DigitalContentPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            // Проверка валидности модели
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Проверка совпадения паролей
            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                return BadRequest("Passwords do not match");
            }

            var result = await _authService.RegisterAsync(
                registerDto.Username,
                registerDto.Email,
                registerDto.Password);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(new { token = result.Token, user = new { username = result.Username, email = result.Email, role = result.Role } });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            // Проверка валидности модели
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(
                loginDto.Email,
                loginDto.Password);

            if (!result.Success)
                return Unauthorized(result.Message);

            return Ok(new { token = result.Token, user = new { username = result.Username, email = result.Email, role = result.Role } });
        }
    }
}
