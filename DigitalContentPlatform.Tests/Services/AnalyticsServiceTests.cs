using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.DTOs.Admin;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Services;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace DigitalContentPlatform.Tests.Services
{
    public class AnalyticsServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IDigitalItemRepository> _digitalItemRepositoryMock;
        private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
        private readonly Mock<IOrderRepository> _orderRepositoryMock;
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _digitalItemRepositoryMock = new Mock<IDigitalItemRepository>();
            _categoryRepositoryMock = new Mock<ICategoryRepository>();
            _orderRepositoryMock = new Mock<IOrderRepository>();
            
            _analyticsService = new AnalyticsService(
                _userRepositoryMock.Object,
                _digitalItemRepositoryMock.Object,
                _categoryRepositoryMock.Object,
                _orderRepositoryMock.Object
            );
        }

        [Fact]
        public async Task GetDashboardStatsAsync_ShouldReturnCorrectStats()
        {
            // Arrange
            var totalUsers = 100;
            var totalItems = 50;
            
            var orders = new List<Order>
            {
                new Order { Id = Guid.NewGuid(), TotalAmount = 10.99m },
                new Order { Id = Guid.NewGuid(), TotalAmount = 20.99m },
                new Order { Id = Guid.NewGuid(), TotalAmount = 15.99m }
            };
            
            var userRegistrations = new List<MonthlyStats>
            {
                new MonthlyStats { Month = "Jan 2023", Count = 10 },
                new MonthlyStats { Month = "Feb 2023", Count = 15 },
                new MonthlyStats { Month = "Mar 2023", Count = 20 }
            };
            
            var salesByMonth = new List<MonthlyStats>
            {
                new MonthlyStats { Month = "Jan 2023", Count = 5 },
                new MonthlyStats { Month = "Feb 2023", Count = 8 },
                new MonthlyStats { Month = "Mar 2023", Count = 12 }
            };
            
            var topCategories = new List<CategoryStats>
            {
                new CategoryStats { CategoryName = "Category 1", ItemCount = 20, OrderCount = 15, Revenue = 150.99m },
                new CategoryStats { CategoryName = "Category 2", ItemCount = 15, OrderCount = 10, Revenue = 100.50m }
            };

            _userRepositoryMock.Setup(x => x.GetTotalCountAsync())
                .ReturnsAsync(totalUsers);
                
            _digitalItemRepositoryMock.Setup(x => x.GetTotalCountAsync())
                .ReturnsAsync(totalItems);
                
            _orderRepositoryMock.Setup(x => x.GetAllOrdersAsync())
                .ReturnsAsync(orders);
                
            _userRepositoryMock.Setup(x => x.GetUserRegistrationsByMonthAsync(12))
                .ReturnsAsync(userRegistrations);
                
            _orderRepositoryMock.Setup(x => x.GetSalesByMonthAsync(12))
                .ReturnsAsync(salesByMonth);
                
            _categoryRepositoryMock.Setup(x => x.GetTopCategoriesAsync(5))
                .ReturnsAsync(topCategories);

            // Act
            var result = await _analyticsService.GetDashboardStatsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(totalUsers, result.TotalUsers);
            Assert.Equal(totalItems, result.TotalItems);
            Assert.Equal(orders.Count, result.TotalOrders);
            Assert.Equal(orders.Sum(o => o.TotalAmount), result.TotalRevenue);
            
            Assert.Equal(userRegistrations.Count, result.UserRegistrationsByMonth.Count);
            Assert.Equal("Jan 2023", result.UserRegistrationsByMonth[0].Label);
            Assert.Equal(10, result.UserRegistrationsByMonth[0].Value);
            
            Assert.Equal(salesByMonth.Count, result.SalesByMonth.Count);
            Assert.Equal("Jan 2023", result.SalesByMonth[0].Label);
            Assert.Equal(5, result.SalesByMonth[0].Value);
            
            Assert.Equal(topCategories.Count, result.TopCategories.Count);
            Assert.Equal("Category 1", result.TopCategories[0].CategoryName);
            Assert.Equal(20, result.TopCategories[0].ItemCount);
            Assert.Equal(15, result.TopCategories[0].OrderCount);
            Assert.Equal(150.99m, result.TopCategories[0].Revenue);
        }
    }
}