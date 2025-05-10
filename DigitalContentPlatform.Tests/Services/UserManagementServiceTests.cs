using AutoMapper;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Services;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs.Auth;
using Xunit;

namespace DigitalContentPlatform.Tests.Services
{
    public class UserManagementServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly IUserManagementService _userManagementService;

        public UserManagementServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _mapperMock = new Mock<IMapper>();
            _userManagementService = new UserManagementService(_userRepositoryMock.Object, _mapperMock.Object);
        }

        [Fact]
        public async Task GetAllUsersAsync_ShouldReturnPagedResult()
        {
            // Arrange
            var page = 1;
            var pageSize = 10;
            var users = new List<User>
            {
                new User { Id = Guid.NewGuid(), Username = "user1", Email = "user1@example.com", Role = "User" },
                new User { Id = Guid.NewGuid(), Username = "user2", Email = "user2@example.com", Role = "Admin" }
            };
            var userDtos = new List<UserDto>
            {
                new UserDto { Id = users[0].Id, Username = "user1", Email = "user1@example.com", Role = "User" },
                new UserDto { Id = users[1].Id, Username = "user2", Email = "user2@example.com", Role = "Admin" }
            };

            var pagedUsers = new PagedResult<User>
            {
                Items = users,
                TotalItems = 2,
                Page = page,
                PageSize = pageSize,
                TotalPages = 1
            };

            _userRepositoryMock.Setup(x => x.GetAllAsync(page, pageSize))
                .ReturnsAsync(pagedUsers);

            _mapperMock.Setup(x => x.Map<List<UserDto>>(users))
                .Returns(userDtos);

            // Act
            var result = await _userManagementService.GetAllUsersAsync(page, pageSize);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Items.Count);
            Assert.Equal(2, result.TotalItems);
            Assert.Equal(1, result.Page);
            Assert.Equal(10, result.PageSize);
            Assert.Equal(1, result.TotalPages);
        }

        [Fact]
        public async Task GetUserByIdAsync_WithValidId_ShouldReturnUser()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Username = "testuser", Email = "test@example.com", Role = "User" };
            var userDto = new UserDto { Id = userId, Username = "testuser", Email = "test@example.com", Role = "User" };

            _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
                .ReturnsAsync(user);

            _mapperMock.Setup(x => x.Map<UserDto>(user))
                .Returns(userDto);

            // Act
            var result = await _userManagementService.GetUserByIdAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.Id);
            Assert.Equal("testuser", result.Username);
            Assert.Equal("test@example.com", result.Email);
            Assert.Equal("User", result.Role);
        }

        [Fact]
        public async Task UpdateUserRoleAsync_WithValidData_ShouldReturnTrue()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Username = "testuser", Email = "test@example.com", Role = "User" };

            _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
                .ReturnsAsync(user);

            _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>()))
                .ReturnsAsync(true);

            // Act
            var result = await _userManagementService.UpdateUserRoleAsync(userId, "Admin");

            // Assert
            Assert.True(result);
            Assert.Equal("Admin", user.Role);
            _userRepositoryMock.Verify(x => x.UpdateAsync(user), Times.Once);
        }

        [Fact]
        public async Task UpdateUserRoleAsync_WithInvalidRole_ShouldReturnFalse()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Username = "testuser", Email = "test@example.com", Role = "User" };

            _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
                .ReturnsAsync(user);

            // Act
            var result = await _userManagementService.UpdateUserRoleAsync(userId, "InvalidRole");

            // Assert
            Assert.False(result);
            Assert.Equal("User", user.Role); // Роль не должна измениться
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task DeleteUserAsync_WithValidId_ShouldReturnTrue()
        {
            // Arrange
            var userId = Guid.NewGuid();

            _userRepositoryMock.Setup(x => x.DeleteAsync(userId))
                .ReturnsAsync(true);

            // Act
            var result = await _userManagementService.DeleteUserAsync(userId);

            // Assert
            Assert.True(result);
            _userRepositoryMock.Verify(x => x.DeleteAsync(userId), Times.Once);
        }
    }
}