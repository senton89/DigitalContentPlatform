// DigitalContentPlatform.Infrastructure/Services/MemoryCacheService.cs
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ConcurrentDictionary<string, bool> _keys = new ConcurrentDictionary<string, bool>();

        public MemoryCacheService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
        {
            if (_cache.TryGetValue(key, out T cachedValue))
            {
                return cachedValue;
            }

            var value = await factory();

            var cacheOptions = new MemoryCacheEntryOptions();
            if (expiration.HasValue)
            {
                cacheOptions.SetAbsoluteExpiration(expiration.Value);
            }
            else
            {
                cacheOptions.SetAbsoluteExpiration(TimeSpan.FromMinutes(10)); // Default expiration
            }

            _cache.Set(key, value, cacheOptions);
            _keys.TryAdd(key, true);

            return value;
        }

        public Task RemoveAsync(string key)
        {
            _cache.Remove(key);
            _keys.TryRemove(key, out _);
            return Task.CompletedTask;
        }

        public Task RemoveByPrefixAsync(string prefix)
        {
            var keysToRemove = _keys.Keys.Where(k => k.StartsWith(prefix)).ToList();
            
            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
                _keys.TryRemove(key, out _);
            }

            return Task.CompletedTask;
        }
    }
}
