// Infrastructure/Services/CloudinaryStorageService.cs
using DigitalContentPlatform.Core.Interfaces.Services;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;

public class CloudinaryService : IFileService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var account = new Account(
            configuration["Cloudinary:CloudName"],
            configuration["Cloudinary:ApiKey"],
            configuration["Cloudinary:ApiSecret"]);

        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder = "shared_content")
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Файл не может быть пустым", nameof(file));

        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream);

        // ⚠️ Перематываем поток в начало
        stream.Position = 0;

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        return uploadResult.SecureUri.ToString();
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        // Для Cloudinary нужно удалить файл по public_id или URL
        // Можно реализовать через API, если требуется
        return true; // заглушка
    }
}