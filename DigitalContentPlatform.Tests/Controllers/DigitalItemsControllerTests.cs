using DigitalContentPlatform.API;
using DigitalContentPlatform.Core.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace DigitalContentPlatform.Tests.Controllers
{
    public class DigitalItemsControllerTests
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;
        private readonly JsonSerializerOptions _jsonOptions;

        public DigitalItemsControllerTests()
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
        public async Task GetAll_WithoutAuth_ShouldReturnOk()
        {
            // Act
            var response = await _client.GetAsync("/api/digitalitems?page=1&pageSize=10");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<PagedResult<DigitalItemDto>>(content, _jsonOptions);

            Assert.NotNull(result);
            Assert.True(result.Items.Count >= 0);
        }

        [Fact]
        public async Task GetById_WithValidId_ShouldReturnOk()
        {
            // Arrange
            // Сначала создаем тестовый элемент
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var createResponse = await CreateTestDigitalItem();
            var createdItem = JsonSerializer.Deserialize<DigitalItemDto>(
                await createResponse.Content.ReadAsStringAsync(), _jsonOptions);

            // Act
            var response = await _client.GetAsync($"/api/digitalitems/{createdItem.Id}");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<DigitalItemDto>(content, _jsonOptions);

            Assert.NotNull(result);
            Assert.Equal(createdItem.Id, result.Id);
            Assert.Equal("Test Digital Item", result.Title);
        }

        [Fact]
        public async Task Create_WithValidData_ShouldReturnCreated()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await CreateTestDigitalItem();

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<DigitalItemResult>(content, _jsonOptions);

            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.NotEqual(Guid.Empty, result.Id);
        }

        [Fact]
        public async Task Update_WithValidData_ShouldReturnOk()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var createResponse = await CreateTestDigitalItem();
            var createdItem = JsonSerializer.Deserialize<DigitalItemResult>(
                await createResponse.Content.ReadAsStringAsync(), _jsonOptions);

            // Создаем форму для обновления
            var formData = new MultipartFormDataContent();
            formData.Add(new StringContent("Updated Test Item"), "Title");
            formData.Add(new StringContent("This is an updated test description"), "Description");
            formData.Add(new StringContent("19.99"), "Price");
            formData.Add(new StringContent(GetTestCategoryId().ToString()), "CategoryId");
            formData.Add(new StringContent("Active"), "Status");

            // Act
            var response = await _client.PutAsync($"/api/digitalitems/{createdItem.Id}", formData);

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<DigitalItemResult>(content, _jsonOptions);

            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.Equal(createdItem.Id, result.Id);
        }

        [Fact]
        public async Task Delete_WithValidId_ShouldReturnNoContent()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var createResponse = await CreateTestDigitalItem();
            var createdItem = JsonSerializer.Deserialize<DigitalItemResult>(
                await createResponse.Content.ReadAsStringAsync(), _jsonOptions);

            // Act
            var response = await _client.DeleteAsync($"/api/digitalitems/{createdItem.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Проверяем, что элемент действительно удален
            var getResponse = await _client.GetAsync($"/api/digitalitems/{createdItem.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        private async Task<HttpResponseMessage> CreateTestDigitalItem()
        {
            var formData = new MultipartFormDataContent();
            formData.Add(new StringContent("Test Digital Item"), "Title");
            formData.Add(new StringContent("This is a test description"), "Description");
            formData.Add(new StringContent("9.99"), "Price");
            formData.Add(new StringContent(GetTestCategoryId().ToString()), "CategoryId");

            // Добавляем тестовый файл
            var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes("Test file content"));
            fileContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            formData.Add(fileContent, "File", "test.pdf");

            // Добавляем тестовую миниатюру
            var thumbnailContent = new ByteArrayContent(Encoding.UTF8.GetBytes("Test thumbnail content"));
            thumbnailContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
            formData.Add(thumbnailContent, "Thumbnail", "test.jpg");

            return await _client.PostAsync("/api/digitalitems", formData);
        }

        private Guid GetTestCategoryId()
        {
            // В реальном тесте здесь бы мы получали ID существующей категории из базы данных
            // Для простоты используем фиксированный ID
            return Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        private async Task<string> GetAuthTokenAsync()
        {
            // Логика получения токена аутентификации для тестов
            var loginData = new
            {
                Email = "test@example.com",
                Password = "Password123!"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(loginData),
                Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync("/api/auth/login", content);
            response.EnsureSuccessStatusCode();

            var result = JsonSerializer.Deserialize<dynamic>(
                await response.Content.ReadAsStringAsync(), _jsonOptions);

            return result.GetProperty("token").GetString();
        }
    }
}