// DigitalContentPlatform.Infrastructure/Repositories/CachedDigitalItemRepository.cs
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class CachedDigitalItemRepository : IDigitalItemRepository
    {
        private readonly IDigitalItemRepository _repository;
        private readonly ICacheService _cacheService;
        private const string CacheKeyPrefix = "digitalItem_";

        public CachedDigitalItemRepository(
            IDigitalItemRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<bool> CreateAsync(DigitalItem item)
        {
            var result = await _repository.CreateAsync(item);
            if (result)
            {
                // Инвалидируем кэш для списков, так как добавлен новый элемент
                await _cacheService.RemoveByPrefixAsync("digitalItems_list");
            }
            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var result = await _repository.DeleteAsync(id);
            if (result)
            {
                // Удаляем элемент из кэша и инвалидируем кэш для списков
                await _cacheService.RemoveAsync($"{CacheKeyPrefix}{id}");
                await _cacheService.RemoveByPrefixAsync("digitalItems_list");
            }
            return result;
        }

        public async Task<PagedResult<DigitalItem>> FilterAsync(FilterParams filterParams)
        {
            // Создаем уникальный ключ для кэша на основе параметров фильтрации
            var cacheKey = $"digitalItems_filter_{filterParams.SearchQuery}_{filterParams.CategoryId}_{filterParams.MinPrice}_{filterParams.MaxPrice}_{filterParams.SortBy}_{filterParams.SortDescending}_{filterParams.Page}_{filterParams.PageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.FilterAsync(filterParams),
                TimeSpan.FromMinutes(5));
        }

        public async Task<PagedResult<DigitalItem>> GetAllAsync(int page, int pageSize)
        {
            var cacheKey = $"digitalItems_list_all_{page}_{pageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetAllAsync(page, pageSize),
                TimeSpan.FromMinutes(5));
        }

        public async Task<PagedResult<DigitalItem>> GetByCategoryAsync(Guid categoryId, int page, int pageSize)
        {
            var cacheKey = $"digitalItems_list_category_{categoryId}_{page}_{pageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetByCategoryAsync(categoryId, page, pageSize),
                TimeSpan.FromMinutes(5));
        }

        public async Task<DigitalItem> GetByIdAsync(Guid id)
        {
            var cacheKey = $"{CacheKeyPrefix}{id}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetByIdAsync(id),
                TimeSpan.FromMinutes(10));
        }

        public async Task<PagedResult<DigitalItem>> GetByUserAsync(Guid userId, int page, int pageSize)
        {
            var cacheKey = $"digitalItems_list_user_{userId}_{page}_{pageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetByUserAsync(userId, page, pageSize),
                TimeSpan.FromMinutes(5));
        }

        public async Task<int> GetTotalCountAsync()
        {
            var cacheKey = "digitalItems_count";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetTotalCountAsync(),
                TimeSpan.FromMinutes(15));
        }

        public async Task<PagedResult<DigitalItem>> SearchAsync(string query, int page, int pageSize)
        {
            var cacheKey = $"digitalItems_search_{query}_{page}_{pageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.SearchAsync(query, page, pageSize),
                TimeSpan.FromMinutes(5));
        }

        public async Task<bool> UpdateAsync(DigitalItem item)
        {
            var result = await _repository.UpdateAsync(item);
            if (result)
            {
                // Обновляем кэш для конкретного элемента и инвалидируем кэш для списков
                await _cacheService.RemoveAsync($"{CacheKeyPrefix}{item.Id}");
                await _cacheService.RemoveByPrefixAsync("digitalItems_list");
            }
            return result;
        }
    }
}
