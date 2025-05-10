using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Services;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace DigitalContentPlatform.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<ITokenService> _tokenServiceMock;
        private readonly IAuthService _authService;

        public AuthServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _tokenServiceMock = new Mock<ITokenService>();
            _authService = new AuthService(_userRepositoryMock.Object, _tokenServiceMock.Object);
        }

        [Fact]
        public async Task RegisterAsync_WithNewUser_ShouldReturnSuccess()
        {
            // Arrange
            var username = "testuser";
            var email = "test@example.com";
            var password = "Password123!";

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(email))
                .ReturnsAsync((User)null);

            _userRepositoryMock.Setup(x => x.GetByUsernameAsync(username))
                .ReturnsAsync((User)null);

            _userRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<User>()))
                .ReturnsAsync(true);

            _tokenServiceMock.Setup(x => x.CreateToken(It.IsAny<User>()))
                .Returns("test_token");

            // Act
            var result = await _authService.RegisterAsync(username, email, password);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("test_token", result.Token);
            Assert.Equal(username, result.Username);
            Assert.Equal(email, result.Email);
            Assert.Equal("User", result.Role);
            
            _userRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<User>()), Times.Once);
            _tokenServiceMock.Verify(x => x.CreateToken(It.IsAny<User>()), Times.Once);
        }

        [Fact]
        public async Task RegisterAsync_WithExistingEmail_ShouldReturnFailure()
        {
            // Arrange
            var username = "testuser";
            var email = "existing@example.com";
            var password = "Password123!";

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(email))
                .ReturnsAsync(new User { Email = email });

            // Act
            var result = await _authService.RegisterAsync(username, email, password);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Email is already registered", result.Message);
            
            _userRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task LoginAsync_WithValidCredentials_ShouldReturnSuccess()
        {
            // Arrange
            var email = "test@example.com";
            var password = "Password123!";

            // Создаем хеш пароля для тестирования
            using var hmac = new System.Security.Cryptography.HMACSHA512();
            var passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            var passwordSalt = hmac.Key;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = "testuser",
                Email = email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = "User"
            };

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(email))
                .ReturnsAsync(user);

            _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>()))
                .ReturnsAsync(true);

            _tokenServiceMock.Setup(x => x.CreateToken(user))
                .Returns("test_token");

            // Act
            var result = await _authService.LoginAsync(email, password);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("test_token", result.Token);
            Assert.Equal(user.Username, result.Username);
            Assert.Equal(user.Email, result.Email);
            Assert.Equal(user.Role, result.Role);
            
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Once);
            _tokenServiceMock.Verify(x => x.CreateToken(user), Times.Once);
        }

        [Fact]
        public async Task LoginAsync_WithInvalidPassword_ShouldReturnFailure()
        {
            // Arrange
            var email = "test@example.com";
            var correctPassword = "Password123!";
            var wrongPassword = "WrongPassword123!";

            // Создаем хеш пароля для тестирования
            using var hmac = new System.Security.Cryptography.HMACSHA512();
            var passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(correctPassword));
            var passwordSalt = hmac.Key;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = "testuser",
                Email = email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = "User"
            };

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(email))
                .ReturnsAsync(user);

            // Act
            var result = await _authService.LoginAsync(email, wrongPassword);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Invalid email or password", result.Message);
            
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Never);
            _tokenServiceMock.Verify(x => x.CreateToken(It.IsAny<User>()), Times.Never);
        }
    }
}
