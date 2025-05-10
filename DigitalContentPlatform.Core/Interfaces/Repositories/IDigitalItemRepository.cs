// DigitalContentPlatform.Core/Interfaces/Repositories/IDigitalItemRepository.cs
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Repositories
{
    public interface IDigitalItemRepository
    {
        Task<PagedResult<DigitalItem>> GetAllAsync(int page, int pageSize);
        Task<DigitalItem> GetByIdAsync(Guid id);
        Task<PagedResult<DigitalItem>> GetByCategoryAsync(Guid categoryId, int page, int pageSize);
        Task<PagedResult<DigitalItem>> GetByUserAsync(Guid userId, int page, int pageSize);
        Task<bool> CreateAsync(DigitalItem item);
        Task<bool> UpdateAsync(DigitalItem item);
        Task<bool> DeleteAsync(Guid id);
        Task<int> GetTotalCountAsync();

        Task<PagedResult<DigitalItem>> SearchAsync(string query, int page, int pageSize);
        Task<PagedResult<DigitalItem>> FilterAsync(FilterParams filterParams);
    }
}
