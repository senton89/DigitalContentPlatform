using DigitalContentPlatform.Core.DTOs.Admin;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IUserRepository _userRepository;
        private readonly IDigitalItemRepository _digitalItemRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IOrderRepository _orderRepository;

        public AnalyticsService(
            IUserRepository userRepository,
            IDigitalItemRepository digitalItemRepository,
            ICategoryRepository categoryRepository,
            IOrderRepository orderRepository)
        {
            _userRepository = userRepository;
            _digitalItemRepository = digitalItemRepository;
            _categoryRepository = categoryRepository;
            _orderRepository = orderRepository;
        }

        public async Task<DashboardStats> GetDashboardStatsAsync()
        {
            // Получаем общие статистические данные
            var totalUsers = await _userRepository.GetTotalCountAsync();
            var totalItems = await _digitalItemRepository.GetTotalCountAsync();
            var orders = await _orderRepository.GetAllOrdersAsync();
            var totalOrders = orders.Count;
            var totalRevenue = orders.Sum(o => o.TotalAmount);

            // Получаем данные для графиков
            var userRegistrationsByMonth = await _userRepository.GetUserRegistrationsByMonthAsync(12);
            var salesByMonth = await _orderRepository.GetSalesByMonthAsync(12);

            // Получаем статистику по категориям
            var topCategories = await _categoryRepository.GetTopCategoriesAsync(5);

            return new DashboardStats
            {
                TotalUsers = totalUsers,
                TotalItems = totalItems,
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                UserRegistrationsByMonth = userRegistrationsByMonth.Select(x => new ChartData
                {
                    Label = x.Month,
                    Value = x.Count
                }).ToList(),
                SalesByMonth = salesByMonth.Select(x => new ChartData
                {
                    Label = x.Month,
                    Value = x.Count
                }).ToList(),
                TopCategories = topCategories.Select(x => new CategoryStats
                {
                    CategoryName = x.CategoryName,
                    ItemCount = x.ItemCount,
                    OrderCount = x.OrderCount,
                    Revenue = x.Revenue
                }).ToList()
            };
        }
    }
}
