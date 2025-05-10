using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Repositories;
using DigitalContentPlatform.Infrastructure.Services;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace DigitalContentPlatform.Tests.Performance
{
    public class CachingPerformanceTests
    {
        private readonly ITestOutputHelper _output;
        private readonly Mock<IDigitalItemRepository> _repositoryMock;
        private readonly IMemoryCache _memoryCache;
        private readonly ICacheService _cacheService;
        private readonly IDigitalItemRepository _cachedRepository;

        public CachingPerformanceTests(ITestOutputHelper output)
        {
            _output = output;
            _repositoryMock = new Mock<IDigitalItemRepository>();
            _memoryCache = new MemoryCache(new MemoryCacheOptions());
            _cacheService = new MemoryCacheService(_memoryCache);
            _cachedRepository = new CachedDigitalItemRepository(_repositoryMock.Object, _cacheService);
        }

        [Fact]
        public async Task GetByIdAsync_WithCaching_ShouldBeFaster()
        {
            // Arrange
            var itemId = Guid.NewGuid();
            var item = new DigitalItem
            {
                Id = itemId,
                Title = "Test Item",
                Description = "Test Description",
                Price = 9.99m,
                Status = "Active"
            };

            _repositoryMock.Setup(r => r.GetByIdAsync(itemId))
                .ReturnsAsync(() => {
                    // Имитируем задержку базы данных
                    Task.Delay(100).Wait();
                    return item;
                });

            var stopwatch = new Stopwatch();
            
            // Act - First call (no cache)
            stopwatch.Start();
            var result1 = await _cachedRepository.GetByIdAsync(itemId);
            stopwatch.Stop();
            var firstCallTime = stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"First call (no cache): {firstCallTime}ms");

            // Act - Second call (with cache)
            stopwatch.Restart();
            var result2 = await _cachedRepository.GetByIdAsync(itemId);
            stopwatch.Stop();
            var secondCallTime = stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"Second call (with cache): {secondCallTime}ms");

            // Assert
            Assert.Equal(item.Id, result1.Id);
            Assert.Equal(item.Id, result2.Id);
            Assert.True(secondCallTime < firstCallTime, $"Cached call ({secondCallTime}ms) should be faster than non-cached call ({firstCallTime}ms)");
            _repositoryMock.Verify(r => r.GetByIdAsync(itemId), Times.Once);
        }

        [Fact]
        public async Task GetAllAsync_WithCaching_ShouldBeFaster()
        {
            // Arrange
            var items = new List<DigitalItem>
            {
                new DigitalItem { Id = Guid.NewGuid(), Title = "Item 1" },
                new DigitalItem { Id = Guid.NewGuid(), Title = "Item 2" }
            };

            var pagedResult = new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = 2,
                Page = 1,
                PageSize = 10,
                TotalPages = 1
            };

            _repositoryMock.Setup(r => r.GetAllAsync(1, 10))
                .ReturnsAsync(() => {
                    // Имитируем задержку базы данных
                    Task.Delay(200).Wait();
                    return pagedResult;
                });

            var stopwatch = new Stopwatch();
            
            // Act - First call (no cache)
            stopwatch.Start();
            var result1 = await _cachedRepository.GetAllAsync(1, 10);
            stopwatch.Stop();
            var firstCallTime = stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"First call (no cache): {firstCallTime}ms");

            // Act - Second call (with cache)
            stopwatch.Restart();
            var result2 = await _cachedRepository.GetAllAsync(1, 10);
            stopwatch.Stop();
            var secondCallTime = stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"Second call (with cache): {secondCallTime}ms");

            // Assert
            Assert.Equal(2, result1.Items.Count);
            Assert.Equal(2, result2.Items.Count);
            Assert.True(secondCallTime < firstCallTime, $"Cached call ({secondCallTime}ms) should be faster than non-cached call ({firstCallTime}ms)");
            _repositoryMock.Verify(r => r.GetAllAsync(1, 10), Times.Once);
        }
    }
}
