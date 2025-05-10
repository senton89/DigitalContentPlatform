using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs.Admin;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .Include(c => c.SubCategories)
                .Include(c => c.ParentCategory)
                .ToListAsync();
        }

        public async Task<Category> GetByIdAsync(Guid id)
        {
            return await _context.Categories
                .Include(c => c.SubCategories)
                .Include(c => c.ParentCategory)
                .Include(c => c.DigitalItems)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<bool> CreateAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var category = await GetByIdAsync(id);
            if (category == null) return false;

            _context.Categories.Remove(category);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<List<CategoryStats>> GetTopCategoriesAsync(int count)
        {
            var categories = await _context.Categories
                .AsNoTracking()
                .Select(c => new CategoryStats
                {
                    CategoryName = c.Name,
                    ItemCount = c.DigitalItems.Count,
                    OrderCount = c.DigitalItems.SelectMany(i => i.OrderItems).Count(),
                    Revenue = c.DigitalItems.SelectMany(i => i.OrderItems).Sum(oi => oi.Price)
                })
                .OrderByDescending(c => c.Revenue)
                .Take(count)
                .ToListAsync();

            return categories;
        }
    }
}
