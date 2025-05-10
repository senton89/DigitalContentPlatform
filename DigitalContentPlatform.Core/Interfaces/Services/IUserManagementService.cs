using DigitalContentPlatform.Core.DTOs.Auth;
using DigitalContentPlatform.Core.DTOs;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface IUserManagementService
    {
        Task<PagedResult<UserDto>> GetAllUsersAsync(int page, int pageSize);
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<bool> UpdateUserRoleAsync(Guid id, string role);
        Task<bool> DeleteUserAsync(Guid id);
    }
}
