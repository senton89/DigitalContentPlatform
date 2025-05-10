using DigitalContentPlatform.API;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace DigitalContentPlatform.Tests.Performance
{
    public class ApiPerformanceTests
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;
        private readonly ITestOutputHelper _output;

        public ApiPerformanceTests(ITestOutputHelper output)
        {
            _output = output;

            var webHostBuilder = new WebHostBuilder()
                .UseContentRoot(System.IO.Directory.GetCurrentDirectory())
                .UseConfiguration(new ConfigurationBuilder()
                    .SetBasePath(System.IO.Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .Build())
                .UseStartup<Startup>();

            _server = new TestServer(webHostBuilder);
            _client = _server.CreateClient();
        }

        [Fact]
        public async Task GetAllItems_Performance()
        {
            // Arrange
            int iterations = 10;
            var stopwatch = new Stopwatch();
            double totalElapsedMs = 0;

            // Act
            for (int i = 0; i < iterations; i++)
            {
                stopwatch.Restart();
                var response = await _client.GetAsync("/api/digitalitems?page=1&pageSize=10");
                response.EnsureSuccessStatusCode();
                stopwatch.Stop();
                
                totalElapsedMs += stopwatch.ElapsedMilliseconds;
                _output.WriteLine($"Request {i + 1}: {stopwatch.ElapsedMilliseconds}ms");
            }

            double averageElapsedMs = totalElapsedMs / iterations;
            _output.WriteLine($"Average response time: {averageElapsedMs}ms");

            // Assert
            Assert.True(averageElapsedMs < 200, $"Average response time ({averageElapsedMs}ms) exceeds threshold (200ms)");
        }

        [Fact]
        public async Task SearchItems_Performance()
        {
            // Arrange
            int iterations = 10;
            var stopwatch = new Stopwatch();
            double totalElapsedMs = 0;
            string searchQuery = "test";

            // Act
            for (int i = 0; i < iterations; i++)
            {
                stopwatch.Restart();
                var response = await _client.GetAsync($"/api/search?query={searchQuery}&page=1&pageSize=10");
                response.EnsureSuccessStatusCode();
                stopwatch.Stop();
                
                totalElapsedMs += stopwatch.ElapsedMilliseconds;
                _output.WriteLine($"Request {i + 1}: {stopwatch.ElapsedMilliseconds}ms");
            }

            double averageElapsedMs = totalElapsedMs / iterations;
            _output.WriteLine($"Average response time: {averageElapsedMs}ms");

            // Assert
            Assert.True(averageElapsedMs < 300, $"Average response time ({averageElapsedMs}ms) exceeds threshold (300ms)");
        }

        [Fact]
        public async Task GetItemById_Performance()
        {
            // Arrange
            int iterations = 10;
            var stopwatch = new Stopwatch();
            double totalElapsedMs = 0;
            string itemId = "11111111-1111-1111-1111-111111111111"; // Тестовый ID

            // Act
            for (int i = 0; i < iterations; i++)
            {
                stopwatch.Restart();
                var response = await _client.GetAsync($"/api/digitalitems/{itemId}");
                stopwatch.Stop();
                
                totalElapsedMs += stopwatch.ElapsedMilliseconds;
                _output.WriteLine($"Request {i + 1}: {stopwatch.ElapsedMilliseconds}ms");
            }

            double averageElapsedMs = totalElapsedMs / iterations;
            _output.WriteLine($"Average response time: {averageElapsedMs}ms");

            // Assert
            Assert.True(averageElapsedMs < 100, $"Average response time ({averageElapsedMs}ms) exceeds threshold (100ms)");
        }
    }
}
