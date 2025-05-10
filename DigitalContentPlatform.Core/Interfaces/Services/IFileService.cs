// DigitalContentPlatform.Core/Interfaces/Services/IFileService.cs
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folder);
        Task<bool> DeleteFileAsync(string filePath);
    }
}
