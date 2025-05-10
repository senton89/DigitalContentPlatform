// DigitalContentPlatform.Tests/Services/FileServiceTests.cs
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace DigitalContentPlatform.Tests.Services
{
    public class FileServiceTests
    {
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly Mock<IConfigurationSection> _fileStorageSection;
        private readonly Mock<IConfigurationSection> _basePathSection;
        private readonly Mock<IConfigurationSection> _allowedExtensionsSection;
        private readonly IFileService _fileService;

        public FileServiceTests()
        {
            _configurationMock = new Mock<IConfiguration>();
            _fileStorageSection = new Mock<IConfigurationSection>();
            _basePathSection = new Mock<IConfigurationSection>();
            _allowedExtensionsSection = new Mock<IConfigurationSection>();

            _configurationMock.Setup(x => x.GetSection("FileStorage"))
                .Returns(_fileStorageSection.Object);
            _fileStorageSection.Setup(x => x.GetSection("BasePath"))
                .Returns(_basePathSection.Object);
            _fileStorageSection.Setup(x => x.GetSection("AllowedExtensions"))
                .Returns(_allowedExtensionsSection.Object);

            _basePathSection.Setup(x => x.Value).Returns("TestUploads");
            _allowedExtensionsSection.Setup(x => x.Get<string[]>())
                .Returns(new[] { ".pdf", ".zip", ".jpg", ".png" });

            _fileService = new FileService(_configurationMock.Object);
        }

        [Fact]
        public async Task SaveFileAsync_WithValidFile_ShouldReturnFilePath()
        {
            // Arrange
            var fileName = "test.jpg";
            var content = "Test file content";
            var file = CreateMockFile(fileName, content);

            // Act
            var result = await _fileService.SaveFileAsync(file.Object, "items");

            // Assert
            Assert.NotNull(result);
            Assert.Contains("TestUploads/items/", result);
            Assert.EndsWith(".jpg", result);
        }

        [Fact]
        public async Task SaveFileAsync_WithInvalidExtension_ShouldThrowException()
        {
            // Arrange
            var fileName = "test.exe";
            var content = "Test file content";
            var file = CreateMockFile(fileName, content);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => 
                _fileService.SaveFileAsync(file.Object, "items"));
        }

        [Fact]
        public async Task SaveFileAsync_WithNullFile_ShouldThrowException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => 
                _fileService.SaveFileAsync(null, "items"));
        }

        [Fact]
        public async Task DeleteFileAsync_WithValidPath_ShouldReturnTrue()
        {
            // Arrange
            var tempFile = Path.GetTempFileName();
            File.WriteAllText(tempFile, "Test content");

            // Act
            var result = await _fileService.DeleteFileAsync(tempFile);

            // Assert
            Assert.True(result);
            Assert.False(File.Exists(tempFile));
        }

        [Fact]
        public async Task DeleteFileAsync_WithInvalidPath_ShouldReturnFalse()
        {
            // Arrange
            var nonExistentPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

            // Act
            var result = await _fileService.DeleteFileAsync(nonExistentPath);

            // Assert
            Assert.False(result);
        }

        private Mock<IFormFile> CreateMockFile(string fileName, string content)
        {
            var fileMock = new Mock<IFormFile>();
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            fileMock.Setup(f => f.OpenReadStream()).Returns(ms);
            fileMock.Setup(f => f.FileName).Returns(fileName);
            fileMock.Setup(f => f.Length).Returns(ms.Length);

            return fileMock;
        }
    }
}
