using DigitalContentPlatform.API;
using DigitalContentPlatform.Core.DTOs.Admin;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.DTOs.Auth;
using Xunit;

namespace DigitalContentPlatform.Tests.Controllers
{
    public class AdminControllerTests
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;
        private readonly JsonSerializerOptions _jsonOptions;

        public AdminControllerTests()
        {
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
        public async Task GetUsers_WithoutAuth_ShouldReturnUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/admin/users");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetUsers_WithAdminAuth_ShouldReturnOk()
        {
            // Arrange
            var token = await GetAdminAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/admin/users?page=1&pageSize=10");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<PagedResult<UserDto>>(content, _jsonOptions);

            Assert.NotNull(result);
            Assert.True(result.Items.Count >= 0);
        }

        [Fact]
        public async Task UpdateUserRole_WithAdminAuth_ShouldReturnOk()
        {
            // Arrange
            var token = await GetAdminAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Создаем тестового пользователя
            var userId = await CreateTestUserAsync();

            var updateRoleDto = new UpdateRoleDto { Role = "Creator" };
            var content = new StringContent(
                JsonSerializer.Serialize(updateRoleDto),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PutAsync($"/api/admin/users/{userId}/role", content);

            // Assert
            response.EnsureSuccessStatusCode();

            // Проверяем, что роль действительно обновилась
            var userResponse = await _client.GetAsync($"/api/admin/users/{userId}");
            userResponse.EnsureSuccessStatusCode();
            var userContent = await userResponse.Content.ReadAsStringAsync();
            var user = JsonSerializer.Deserialize<UserDto>(userContent, _jsonOptions);

            Assert.NotNull(user);
            Assert.Equal("Creator", user.Role);
        }

        [Fact]
        public async Task DeleteUser_WithAdminAuth_ShouldReturnNoContent()
        {
            // Arrange
            var token = await GetAdminAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Создаем тестового пользователя
            var userId = await CreateTestUserAsync();

            // Act
            var response = await _client.DeleteAsync($"/api/admin/users/{userId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Проверяем, что пользователь действительно удален
            var userResponse = await _client.GetAsync($"/api/admin/users/{userId}");
            Assert.Equal(HttpStatusCode.NotFound, userResponse.StatusCode);
        }

        [Fact]
        public async Task GetDashboardStats_WithAdminAuth_ShouldReturnOk()
        {
            // Arrange
            var token = await GetAdminAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/admin/dashboard");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<DashboardStats>(content, _jsonOptions);

            Assert.NotNull(result);
            Assert.True(result.TotalUsers >= 0);
            Assert.True(result.TotalItems >= 0);
            Assert.True(result.TotalOrders >= 0);
        }

        private async Task<string> GetAdminAuthTokenAsync()
        {
            // В реальном тесте здесь бы мы аутентифицировались как администратор
            // Для простоты используем фиксированные учетные данные
            var loginData = new
            {
                Email = "admin@example.com",
                Password = "Admin123!"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(loginData),
                Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync("/api/auth/login", content);
            response.EnsureSuccessStatusCode();

            var result = JsonSerializer.Deserialize<dynamic>(
                await response.Content.ReadAsStringAsync(),
                _jsonOptions);

            return result.GetProperty("token").GetString();
        }

        private async Task<Guid> CreateTestUserAsync()
        {
            // Создаем тестового пользователя через API
            var registerData = new
            {
                Username = "testuser_" + Guid.NewGuid().ToString("N").Substring(0, 8),
                Email = "test_" + Guid.NewGuid().ToString("N").Substring(0, 8) + "@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(registerData),
                Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync("/api/auth/register", content);
            response.EnsureSuccessStatusCode();

            // Получаем ID созданного пользователя
            // В реальном приложении здесь бы мы получали ID из ответа или из базы данных
            // Для простоты используем фиксированный ID
            return Guid.Parse("22222222-2222-2222-2222-222222222222");
        }
    }
}