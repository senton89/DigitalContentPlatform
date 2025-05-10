using DigitalContentPlatform.Core.DTOs.Auth;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        public AuthService(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        public async Task<AuthResult> RegisterAsync(string username, string email, string password)
        {
            // Проверка, существует ли пользователь с таким email
            var existingUserByEmail = await _userRepository.GetByEmailAsync(email);
            if (existingUserByEmail != null)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Email is already registered"
                };
            }

            // Проверка, существует ли пользователь с таким username
            var existingUserByUsername = await _userRepository.GetByUsernameAsync(username);
            if (existingUserByUsername != null)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Username is already taken"
                };
            }

            // Создание хеша пароля
            using var hmac = new HMACSHA512();

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                Email = email,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)),
                PasswordSalt = hmac.Key,
                CreatedAt = DateTime.UtcNow
            };

            // Сохранение пользователя
            var result = await _userRepository.CreateAsync(user);
            if (!result)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Failed to create user"
                };
            }

            // Создание токена
            var token = _tokenService.CreateToken(user);

            return new AuthResult
            {
                Success = true,
                Token = token,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<AuthResult> LoginAsync(string email, string password)
        {
            // Поиск пользователя по email
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return new AuthResult
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            // Проверка пароля
            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i])
                {
                    return new AuthResult
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    };
                }
            }

            // Обновление времени последнего входа
            user.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Создание токена
            var token = _tokenService.CreateToken(user);

            return new AuthResult
            {
                Success = true,
                Token = token,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}
