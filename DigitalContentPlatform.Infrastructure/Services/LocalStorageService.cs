// Infrastructure/Services/LocalStorageService.cs
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

public class LocalStorageService : IFileService
{
    private readonly string _uploadPath;

    public LocalStorageService(IConfiguration configuration)
    {
        _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), 
            configuration["AppSettings:UploadPath"] ?? "wwwroot/uploads/shared");

        if (!Directory.Exists(_uploadPath))
            Directory.CreateDirectory(_uploadPath);
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder = "shared_content")
    {
        var fullPath = Path.Combine(_uploadPath, folder);
        if (!Directory.Exists(fullPath))
            Directory.CreateDirectory(fullPath);

        var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(fullPath, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/{folder}/{fileName}";
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        var fullFilePath = Path.Combine(_uploadPath, filePath.TrimStart('/'));
        if (System.IO.File.Exists(fullFilePath))
        {
            System.IO.File.Delete(fullFilePath);
            return true;
        }
        return false;
    }
}