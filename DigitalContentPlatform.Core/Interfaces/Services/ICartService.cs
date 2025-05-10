using DigitalContentPlatform.Core.DTOs;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(Guid userId);
        Task<CartDto> AddToCartAsync(Guid userId, Guid digitalItemId);
        Task<CartDto> RemoveFromCartAsync(Guid userId, Guid cartItemId);
        Task<bool> ClearCartAsync(Guid userId);
    }
}