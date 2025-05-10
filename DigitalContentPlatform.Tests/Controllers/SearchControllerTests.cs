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
    public class SearchControllerTests
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;
        private readonly JsonSerializerOptions _jsonOptions;

        public SearchControllerTests()
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
        public async Task Search_WithValidQuery_ShouldReturnOk()
        {
            // Act
            var response = await _client.GetAsync("/api/search?query=test&page=1&pageSize=10");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<PagedResult<DigitalItemDto>>(content, _jsonOptions);

            Assert.NotNull(result);
            Assert.True(result.Items.Count >= 0);
        }

        [Fact]
        public async Task Filter_WithValidParams_ShouldReturnOk()
        {
            // Arrange
            var filterParams = new FilterParams
            {
                SearchQuery = "test",
                CategoryId = null,
                MinPrice = 0,
                MaxPrice = 100,
                SortBy = "Price",
                SortDescending = false,
                Page = 1,
                PageSize = 10
            };

            var content = new StringContent(
                JsonSerializer.Serialize(filterParams),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/search/filter", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<PagedResult<DigitalItemDto>>(responseContent, _jsonOptions);

            Assert.NotNull(result);
            Assert.True(result.Items.Count >= 0);
        }
    }
}
