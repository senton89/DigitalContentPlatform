// DigitalContentPlatform.Infrastructure/Services/FileService.cs
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Linq;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IConfiguration _configuration;

        public FileService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null");

            var basePath = _configuration["FileStorage:BasePath"];
            var allowedExtensions = _configuration.GetSection("FileStorage:AllowedExtensions").Get<string[]>();

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                throw new ArgumentException($"File extension {extension} is not allowed");

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(basePath, folder, fileName);

            Directory.CreateDirectory(Path.Combine(basePath, folder));

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return filePath;
        }

        public async Task<bool> DeleteFileAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath))
                return false;

            try
            {
                File.Delete(filePath);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
