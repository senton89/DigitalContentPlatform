using DigitalContentPlatform.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs.Admin;

namespace DigitalContentPlatform.Core.Interfaces.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category> GetByIdAsync(Guid id);
        Task<bool> CreateAsync(Category category);
        Task<bool> UpdateAsync(Category category);
        Task<bool> DeleteAsync(Guid id);
        Task<List<CategoryStats>> GetTopCategoriesAsync(int count);
    }
}
