using DigitalContentPlatform.API;
using DigitalContentPlatform.Core.DTOs.Auth;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace DigitalContentPlatform.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;
        private readonly JsonSerializerOptions _jsonOptions;

        public AuthControllerTests()
        {
            // Настройка тестового сервера
            var webHostBuilder = new WebHostBuilder()
                .UseContentRoot(System.IO.Directory.GetCurrentDirectory())
                .UseConfiguration(new ConfigurationBuilder()
                    .SetBasePath(System.IO.Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .Build())
                .UseStartup<Startup>();

            _server = new TestServer(webHostBuilder);
            _client = _server.CreateClient();
            
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        [Fact]
        public async Task Register_WithValidData_ShouldReturnOk()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "testuser_" + System.Guid.NewGuid().ToString("N").Substring(0, 8),
                Email = "test_" + System.Guid.NewGuid().ToString("N").Substring(0, 8) + "@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(registerDto),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<dynamic>(responseString, _jsonOptions);
            
            Assert.NotNull(result);
            Assert.NotNull(result.GetProperty("token").GetString());
        }

        [Fact]
        public async Task Register_WithExistingEmail_ShouldReturnBadRequest()
        {
            // Arrange - Сначала регистрируем пользователя
            var email = "existing_" + System.Guid.NewGuid().ToString("N").Substring(0, 8) + "@example.com";
            
            var firstRegisterDto = new RegisterDto
            {
                Username = "firstuser_" + System.Guid.NewGuid().ToString("N").Substring(0, 8),
                Email = email,
                Password = "Password123!",
                ConfirmPassword = "Password123!"
            };

            var firstContent = new StringContent(
                JsonSerializer.Serialize(firstRegisterDto),
                Encoding.UTF8,
                "application/json");

            await _client.PostAsync("/api/auth/register", firstContent);

            // Теперь пытаемся зарегистрировать другого пользователя с тем же email
            var secondRegisterDto = new RegisterDto
            {
                Username = "seconduser_" + System.Guid.NewGuid().ToString("N").Substring(0, 8),
                Email = email,
                Password = "Password123!",
                ConfirmPassword = "Password123!"
            };

            var secondContent = new StringContent(
                JsonSerializer.Serialize(secondRegisterDto),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", secondContent);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ShouldReturnOk()
        {
            // Arrange - Сначала регистрируем пользователя
            var username = "loginuser_" + System.Guid.NewGuid().ToString("N").Substring(0, 8);
            var email = "login_" + System.Guid.NewGuid().ToString("N").Substring(0, 8) + "@example.com";
            var password = "Password123!";
            
            var registerDto = new RegisterDto
            {
                Username = username,
                Email = email,
                Password = password,
                ConfirmPassword = password
            };

            var registerContent = new StringContent(
                JsonSerializer.Serialize(registerDto),
                Encoding.UTF8,
                "application/json");

            await _client.PostAsync("/api/auth/register", registerContent);

            // Теперь пытаемся войти
            var loginDto = new LoginDto
            {
                Email = email,
                Password = password
            };

            var loginContent = new StringContent(
                JsonSerializer.Serialize(loginDto),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/login", loginContent);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<dynamic>(responseString, _jsonOptions);
            
            Assert.NotNull(result);
            Assert.NotNull(result.GetProperty("token").GetString());
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "WrongPassword123!"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(loginDto),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/login", content);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
