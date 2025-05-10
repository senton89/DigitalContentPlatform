using AutoMapper;
using DigitalContentPlatform.Core.DTOs.Auth;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserManagementService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<PagedResult<UserDto>> GetAllUsersAsync(int page, int pageSize)
        {
            var users = await _userRepository.GetAllAsync(page, pageSize);
            return new PagedResult<UserDto>
            {
                Items = _mapper.Map<List<UserDto>>(users.Items),
                TotalItems = users.TotalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(users.TotalItems / (double)pageSize)
            };
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return null;
            
            return _mapper.Map<UserDto>(user);
        }

        public async Task<bool> UpdateUserRoleAsync(Guid id, string role)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return false;

            // Проверка валидности роли
            if (role != "User" && role != "Admin" && role != "Creator")
                return false;

            user.Role = role;
            return await _userRepository.UpdateAsync(user);
        }

        public async Task<bool> DeleteUserAsync(Guid id)
        {
            return await _userRepository.DeleteAsync(id);
        }
    }
}
