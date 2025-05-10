using AutoMapper;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Services;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace DigitalContentPlatform.Tests.Services
{
    public class SearchServiceTests
    {
        private readonly Mock<IDigitalItemRepository> _digitalItemRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly ISearchService _searchService;

        public SearchServiceTests()
        {
            _digitalItemRepositoryMock = new Mock<IDigitalItemRepository>();
            _mapperMock = new Mock<IMapper>();
            _searchService = new SearchService(_digitalItemRepositoryMock.Object, _mapperMock.Object);
        }

        [Fact]
        public async Task SearchDigitalItemsAsync_WithEmptyQuery_ShouldReturnAllItems()
        {
            // Arrange
            var page = 1;
            var pageSize = 10;
            var items = new List<DigitalItem>
            {
                new DigitalItem { Id = Guid.NewGuid(), Title = "Item 1" },
                new DigitalItem { Id = Guid.NewGuid(), Title = "Item 2" }
            };
            var itemDtos = new List<DigitalItemDto>
            {
                new DigitalItemDto { Id = items[0].Id, Title = "Item 1" },
                new DigitalItemDto { Id = items[1].Id, Title = "Item 2" }
            };

            var pagedResult = new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = 2,
                Page = page,
                PageSize = pageSize,
                TotalPages = 1
            };

            var pagedDtoResult = new PagedResult<DigitalItemDto>
            {
                Items = itemDtos,
                TotalItems = 2,
                Page = page,
                PageSize = pageSize,
                TotalPages = 1
            };

            _digitalItemRepositoryMock.Setup(x => x.GetAllAsync(page, pageSize))
                .ReturnsAsync(pagedResult);

            _mapperMock.Setup(x => x.Map<PagedResult<DigitalItemDto>>(pagedResult))
                .Returns(pagedDtoResult);

            // Act
            var result = await _searchService.SearchDigitalItemsAsync("", page, pageSize);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Items.Count);
            Assert.Equal(2, result.TotalItems);
            Assert.Equal(1, result.Page);
            Assert.Equal(10, result.PageSize);
            Assert.Equal(1, result.TotalPages);

            _digitalItemRepositoryMock.Verify(x => x.GetAllAsync(page, pageSize), Times.Once);
            _digitalItemRepositoryMock.Verify(x => x.SearchAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task SearchDigitalItemsAsync_WithValidQuery_ShouldReturnFilteredItems()
        {
            // Arrange
            var query = "test";
            var page = 1;
            var pageSize = 10;
            var items = new List<DigitalItem>
            {
                new DigitalItem { Id = Guid.NewGuid(), Title = "Test Item" }
            };
            var itemDtos = new List<DigitalItemDto>
            {
                new DigitalItemDto { Id = items[0].Id, Title = "Test Item" }
            };

            var pagedResult = new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = 1,
                Page = page,
                PageSize = pageSize,
                TotalPages = 1
            };

            var pagedDtoResult = new PagedResult<DigitalItemDto>
            {
                Items = itemDtos,
                TotalItems = 1,
                Page = page,
                PageSize = pageSize,
                TotalPages = 1
            };

            _digitalItemRepositoryMock.Setup(x => x.SearchAsync(query, page, pageSize))
                .ReturnsAsync(pagedResult);

            _mapperMock.Setup(x => x.Map<PagedResult<DigitalItemDto>>(pagedResult))
                .Returns(pagedDtoResult);

            // Act
            var result = await _searchService.SearchDigitalItemsAsync(query, page, pageSize);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.Items);
            Assert.Equal("Test Item", result.Items[0].Title);

            _digitalItemRepositoryMock.Verify(x => x.SearchAsync(query, page, pageSize), Times.Once);
            _digitalItemRepositoryMock.Verify(x => x.GetAllAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task FilterDigitalItemsAsync_ShouldReturnFilteredItems()
        {
            // Arrange
            var filterParams = new FilterParams
            {
                SearchQuery = "test",
                CategoryId = Guid.NewGuid(),
                MinPrice = 10,
                MaxPrice = 50,
                SortBy = "Price",
                SortDescending = false,
                Page = 1,
                PageSize = 10
            };

            var items = new List<DigitalItem>
            {
                new DigitalItem { Id = Guid.NewGuid(), Title = "Test Item", Price = 20 }
            };
            var itemDtos = new List<DigitalItemDto>
            {
                new DigitalItemDto { Id = items[0].Id, Title = "Test Item", Price = 20 }
            };

            var pagedResult = new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = 1,
                Page = filterParams.Page,
                PageSize = filterParams.PageSize,
                TotalPages = 1
            };

            var pagedDtoResult = new PagedResult<DigitalItemDto>
            {
                Items = itemDtos,
                TotalItems = 1,
                Page = filterParams.Page,
                PageSize = filterParams.PageSize,
                TotalPages = 1
            };

            _digitalItemRepositoryMock.Setup(x => x.FilterAsync(filterParams))
                .ReturnsAsync(pagedResult);

            _mapperMock.Setup(x => x.Map<PagedResult<DigitalItemDto>>(pagedResult))
                .Returns(pagedDtoResult);

            // Act
            var result = await _searchService.FilterDigitalItemsAsync(filterParams);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.Items);
            Assert.Equal("Test Item", result.Items[0].Title);
            Assert.Equal(20, result.Items[0].Price);

            _digitalItemRepositoryMock.Verify(x => x.FilterAsync(filterParams), Times.Once);
        }
    }
}