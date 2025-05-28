using Microsoft.AspNetCore.Http;

namespace DigitalContentPlatform.Core.Interfaces.Services;

public interface ICloudinaryService
{
    Task<string> UploadFileAsync(IFormFile file, string folder = "shared_content");
}