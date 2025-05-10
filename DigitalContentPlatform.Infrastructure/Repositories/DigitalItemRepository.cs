// DigitalContentPlatform.Infrastructure/Repositories/DigitalItemRepository.cs
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class DigitalItemRepository : IDigitalItemRepository
    {
        private readonly ApplicationDbContext _context;

        public DigitalItemRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<DigitalItem>> GetAllAsync(int page, int pageSize)
        {
            // Сначала получаем только идентификаторы для пагинации
            var query = _context.DigitalItems
                .AsNoTracking()
                .Where(d => d.Status == "Active")
                .OrderByDescending(d => d.CreatedAt);

            var totalItems = await query.CountAsync();
            
            // Затем получаем только нужные данные для отображения в списке
            var itemIds = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => d.Id)
                .ToListAsync();

            // Загружаем полные данные только для выбранных идентификаторов
            var items = await _context.DigitalItems
                .AsNoTracking()
                .Include(d => d.Category)
                .Include(d => d.User)
                .Where(d => itemIds.Contains(d.Id))
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        public async Task<DigitalItem> GetByIdAsync(Guid id)
        {
            return await _context.DigitalItems
                .Include(d => d.Category)
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<PagedResult<DigitalItem>> GetByCategoryAsync(Guid categoryId, int page, int pageSize)
        {
            var query = _context.DigitalItems
                .AsNoTracking()
                .Include(d => d.Category)
                .Include(d => d.User)
                .Where(d => d.CategoryId == categoryId && d.Status == "Active")
                .OrderByDescending(d => d.CreatedAt);

            var totalItems = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        public async Task<PagedResult<DigitalItem>> GetByUserAsync(Guid userId, int page, int pageSize)
        {
            var query = _context.DigitalItems
                .AsNoTracking()
                .Include(d => d.Category)
                .Include(d => d.User)
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.CreatedAt);

            var totalItems = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        public async Task<bool> CreateAsync(DigitalItem item)
        {
            await _context.DigitalItems.AddAsync(item);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAsync(DigitalItem item)
        {
            _context.DigitalItems.Update(item);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var item = await GetByIdAsync(id);
            if (item == null) return false;

            _context.DigitalItems.Remove(item);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _context.DigitalItems.CountAsync();
        }

        public async Task<PagedResult<DigitalItem>> SearchAsync(string query, int page, int pageSize)
        {
            query = query.ToLower();

            // Сначала получаем только идентификаторы для пагинации
            var queryable = _context.DigitalItems
                .AsNoTracking()
                .Where(d => d.Status == "Active" && 
                            (d.Title.ToLower().Contains(query) || 
                             d.Description.ToLower().Contains(query) || 
                             d.Category.Name.ToLower().Contains(query) || 
                             d.User.Username.ToLower().Contains(query)))
                .OrderByDescending(d => d.CreatedAt);

            var totalItems = await queryable.CountAsync();
            
            // Затем получаем только нужные данные для отображения в списке
            var itemIds = await queryable
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => d.Id)
                .ToListAsync();

            // Загружаем полные данные только для выбранных идентификаторов
            var items = await _context.DigitalItems
                .AsNoTracking()
                .Include(d => d.Category)
                .Include(d => d.User)
                .Where(d => itemIds.Contains(d.Id))
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        public async Task<PagedResult<DigitalItem>> FilterAsync(FilterParams filterParams)
        {
            var queryable = _context.DigitalItems
                .AsNoTracking()
                .Include(d => d.Category)
                .Include(d => d.User)
                .Where(d => d.Status == "Active");

            // Apply search query if provided
            if (!string.IsNullOrWhiteSpace(filterParams.SearchQuery))
            {
                var query = filterParams.SearchQuery.ToLower();
                queryable = queryable.Where(d => 
                    d.Title.ToLower().Contains(query) ||
                    d.Description.ToLower().Contains(query) ||
                    d.Category.Name.ToLower().Contains(query) ||
                    d.User.Username.ToLower().Contains(query));
            }

            // Apply category filter if provided
            if (filterParams.CategoryId.HasValue)
            {
                queryable = queryable.Where(d => d.CategoryId == filterParams.CategoryId.Value);
            }

            // Apply price range filters if provided
            if (filterParams.MinPrice.HasValue)
            {
                queryable = queryable.Where(d => d.Price >= filterParams.MinPrice.Value);
            }

            if (filterParams.MaxPrice.HasValue)
            {
                queryable = queryable.Where(d => d.Price <= filterParams.MaxPrice.Value);
            }

            // Apply sorting
            queryable = ApplySorting(queryable, filterParams.SortBy, filterParams.SortDescending);

            var totalItems = await queryable.CountAsync();
            var items = await queryable
                .Skip((filterParams.Page - 1) * filterParams.PageSize)
                .Take(filterParams.PageSize)
                .ToListAsync();

            return new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = totalItems,
                Page = filterParams.Page,
                PageSize = filterParams.PageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)filterParams.PageSize)
            };
        }

        private IQueryable<DigitalItem> ApplySorting(IQueryable<DigitalItem> queryable, string sortBy,
            bool sortDescending)
        {
            switch (sortBy?.ToLower())
            {
                case "title":
                    return sortDescending
                        ? queryable.OrderByDescending(d => d.Title)
                        : queryable.OrderBy(d => d.Title);
                case "price":
                    return sortDescending
                        ? queryable.OrderByDescending(d => d.Price)
                        : queryable.OrderBy(d => d.Price);
                case "createdat":
                default:
                    return sortDescending
                        ? queryable.OrderByDescending(d => d.CreatedAt)
                        : queryable.OrderBy(d => d.CreatedAt);
            }
        }
    }
}
