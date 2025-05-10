using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Repositories
{
    public interface IOrderRepository
    {
        Task<List<Order>> GetAllOrdersAsync();
        Task<List<MonthlyStats>> GetSalesByMonthAsync(int months);
    }
}