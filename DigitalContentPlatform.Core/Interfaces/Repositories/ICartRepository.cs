using DigitalContentPlatform.Core.Entities;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Repositories
{
    public interface ICartRepository
    {
        Task<Cart> GetCartByUserIdAsync(Guid userId);
        Task<bool> AddItemToCartAsync(Guid cartId, Guid digitalItemId, decimal price);
        Task<bool> RemoveItemFromCartAsync(Guid cartItemId);
        Task<bool> ClearCartAsync(Guid cartId);
        Task<bool> CreateCartAsync(Cart cart);
    }
}