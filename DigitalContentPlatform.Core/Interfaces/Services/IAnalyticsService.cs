using DigitalContentPlatform.Core.DTOs.Admin;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface IAnalyticsService
    {
        Task<DashboardStats> GetDashboardStatsAsync();
    }
}
