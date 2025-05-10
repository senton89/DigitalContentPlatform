// DigitalContentPlatform.Tests/Services/DigitalItemServiceTests.cs
using AutoMapper;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Services;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace DigitalContentPlatform.Tests.Services
{
    public class DigitalItemServiceTests
    {
        private readonly Mock<IDigitalItemRepository> _digitalItemRepositoryMock;
        private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
        private readonly Mock<IFileService> _fileServiceMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly IDigitalItemService _digitalItemService;

        public DigitalItemServiceTests()
        {
            _digitalItemRepositoryMock = new Mock<IDigitalItemRepository>();
            _categoryRepositoryMock = new Mock<ICategoryRepository>();
            _fileServiceMock = new Mock<IFileService>();
            _mapperMock = new Mock<IMapper>();
            _digitalItemService = new DigitalItemService(
                _digitalItemRepositoryMock.Object,
                _categoryRepositoryMock.Object,
                _fileServiceMock.Object,
                _mapperMock.Object);
        }

        [Fact]
        public async Task CreateAsync_WithValidData_ShouldReturnSuccess()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var categoryId = Guid.NewGuid();
            var dto = new DigitalItemCreateDto
            {
                Title = "Test Item",
                Description = "Test Description",
                Price = 9.99m,
                CategoryId = categoryId
            };

            _categoryRepositoryMock.Setup(x => x.GetByIdAsync(categoryId))
                .ReturnsAsync(new Category { Id = categoryId, Name = "Test Category" });

            _fileServiceMock.Setup(x => x.SaveFileAsync(It.IsAny<Microsoft.AspNetCore.Http.IFormFile>(), "items"))
                .ReturnsAsync("path/to/file");
            _fileServiceMock.Setup(x => x.SaveFileAsync(It.IsAny<Microsoft.AspNetCore.Http.IFormFile>(), "thumbnails"))
                .ReturnsAsync("path/to/thumbnail");

            _digitalItemRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<DigitalItem>()))
                .ReturnsAsync(true);

            // Act
            var result = await _digitalItemService.CreateAsync(dto, userId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Digital item created successfully", result.Message);
            _digitalItemRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<DigitalItem>()), Times.Once);
            _fileServiceMock.Verify(x => x.SaveFileAsync(It.IsAny<Microsoft.AspNetCore.Http.IFormFile>(), "items"), Times.Once);
            _fileServiceMock.Verify(x => x.SaveFileAsync(It.IsAny<Microsoft.AspNetCore.Http.IFormFile>(), "thumbnails"), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_WithValidData_ShouldReturnSuccess()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var itemId = Guid.NewGuid();
            var categoryId = Guid.NewGuid();
            var dto = new DigitalItemUpdateDto
            {
                Title = "Updated Item",
                Description = "Updated Description",
                Price = 19.99m,
                CategoryId = categoryId,
                Status = "Active"
            };

            var existingItem = new DigitalItem
            {
                Id = itemId,
                UserId = userId,
                FileUrl = "old/path/to/file",
                ThumbnailUrl = "old/path/to/thumbnail"
            };

            _digitalItemRepositoryMock.Setup(x => x.GetByIdAsync(itemId))
                .ReturnsAsync(existingItem);

            _categoryRepositoryMock.Setup(x => x.GetByIdAsync(categoryId))
                .ReturnsAsync(new Category { Id = categoryId, Name = "Updated Category" });

            _digitalItemRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<DigitalItem>()))
                .ReturnsAsync(true);

            // Act
            var result = await _digitalItemService.UpdateAsync(itemId, dto, userId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Digital item updated successfully", result.Message);
            _digitalItemRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<DigitalItem>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WithValidData_ShouldReturnSuccess()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var itemId = Guid.NewGuid();
            var existingItem = new DigitalItem
            {
                Id = itemId,
                UserId = userId,
                FileUrl = "path/to/file",
                ThumbnailUrl = "path/to/thumbnail"
            };

            _digitalItemRepositoryMock.Setup(x => x.GetByIdAsync(itemId))
                .ReturnsAsync(existingItem);

            _fileServiceMock.Setup(x => x.DeleteFileAsync(It.IsAny<string>()))
                .ReturnsAsync(true);

            _digitalItemRepositoryMock.Setup(x => x.DeleteAsync(itemId))
                .ReturnsAsync(true);

            // Act
            var result = await _digitalItemService.DeleteAsync(itemId, userId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Digital item deleted successfully", result.Message);
            _fileServiceMock.Verify(x => x.DeleteFileAsync(It.IsAny<string>()), Times.Exactly(2));
            _digitalItemRepositoryMock.Verify(x => x.DeleteAsync(itemId), Times.Once);
        }
    }
}
