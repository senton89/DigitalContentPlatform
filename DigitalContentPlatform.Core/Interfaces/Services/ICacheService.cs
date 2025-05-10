// DigitalContentPlatform.Core/Interfaces/Services/ICacheService.cs
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface ICacheService
    {
        Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null);
        Task RemoveAsync(string key);
        Task RemoveByPrefixAsync(string prefix);
    }
}
