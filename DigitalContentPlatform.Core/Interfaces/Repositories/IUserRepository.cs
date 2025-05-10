using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(Guid id);
        Task<User> GetByEmailAsync(string email);
        Task<User> GetByUsernameAsync(string username);
        Task<bool> CreateAsync(User user);
        Task<bool> UpdateAsync(User user);
        Task<bool> DeleteAsync(Guid id);
         Task<int> GetTotalCountAsync();
    Task<PagedResult<User>> GetAllAsync(int page, int pageSize);
    Task<List<MonthlyStats>> GetUserRegistrationsByMonthAsync(int months);
    }
}
