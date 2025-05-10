using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        }

        public async Task<bool> CreateAsync(User user)
        {
            await _context.Users.AddAsync(user);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await GetByIdAsync(id);
            if (user == null) return false;
            
            _context.Users.Remove(user);
            return await _context.SaveChangesAsync() > 0;
        }
        
        public async Task<int> GetTotalCountAsync()
        {
            return await _context.Users.CountAsync();
        }
        
        public async Task<PagedResult<User>> GetAllAsync(int page, int pageSize)
        {
            var query = _context.Users
                .AsNoTracking()
                .OrderByDescending(u => u.CreatedAt);

            var totalItems = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<User>
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }
        
        public async Task<List<MonthlyStats>> GetUserRegistrationsByMonthAsync(int months)
        {
            var startDate = DateTime.UtcNow.AddMonths(-months);

            var registrationsData = await _context.Users
                .Where(u => u.CreatedAt >= startDate)
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .Select(g => new { 
                    Year = g.Key.Year, 
                    Month = g.Key.Month, 
                    Count = g.Count() 
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            return registrationsData.Select(r => new MonthlyStats {
                Month = $"{r.Year}-{r.Month}",
                Count = r.Count
            }).ToList();
        }
    }
}
