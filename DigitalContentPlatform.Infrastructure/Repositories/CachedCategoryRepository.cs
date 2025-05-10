// DigitalContentPlatform.Infrastructure/Repositories/CachedCategoryRepository.cs
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs.Admin;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class CachedCategoryRepository : ICategoryRepository
    {
        private readonly ICategoryRepository _repository;
        private readonly ICacheService _cacheService;
        private const string CacheKeyPrefix = "category_";

        public CachedCategoryRepository(
            ICategoryRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<bool> CreateAsync(Category category)
        {
            var result = await _repository.CreateAsync(category);
            if (result)
            {
                await _cacheService.RemoveByPrefixAsync("categories_");
            }
            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var result = await _repository.DeleteAsync(id);
            if (result)
            {
                await _cacheService.RemoveAsync($"{CacheKeyPrefix}{id}");
                await _cacheService.RemoveByPrefixAsync("categories_");
            }
            return result;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            var cacheKey = "categories_all";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetAllAsync(),
                TimeSpan.FromHours(1)); // Категории меняются редко, можно кэшировать дольше
        }

        public async Task<Category> GetByIdAsync(Guid id)
        {
            var cacheKey = $"{CacheKeyPrefix}{id}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetByIdAsync(id),
                TimeSpan.FromHours(1));
        }

        public async Task<List<CategoryStats>> GetTopCategoriesAsync(int count)
        {
            var cacheKey = $"categories_top_{count}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetTopCategoriesAsync(count),
                TimeSpan.FromMinutes(30));
        }

        public async Task<bool> UpdateAsync(Category category)
        {
            var result = await _repository.UpdateAsync(category);
            if (result)
            {
                await _cacheService.RemoveAsync($"{CacheKeyPrefix}{category.Id}");
                await _cacheService.RemoveByPrefixAsync("categories_");
            }
            return result;
        }
    }
}
