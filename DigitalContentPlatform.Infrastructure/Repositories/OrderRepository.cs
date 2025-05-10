using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.Items)
                .ToListAsync();
        }

        public async Task<List<MonthlyStats>> GetSalesByMonthAsync(int months)
        {
            var startDate = DateTime.UtcNow.AddMonths(-months);

            var salesData = await _context.Orders
                .Where(o => o.OrderDate >= startDate)
                .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                .Select(g => new 
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            // Форматирование после получения данных из БД
            return salesData.Select(x => new MonthlyStats
            {
                Month = $"{x.Year}-{x.Month}",
                Count = x.Count
            }).ToList();
        }
    }
}