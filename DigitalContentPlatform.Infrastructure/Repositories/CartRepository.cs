using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _context;

        public CartRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Cart> GetCartByUserIdAsync(Guid userId)
        {
            return await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.DigitalItem)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<bool> AddItemToCartAsync(Guid cartId, Guid digitalItemId, decimal price)
        {
            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cartId,
                DigitalItemId = digitalItemId,
                Price = price,
                AddedAt = DateTime.UtcNow
            };

            await _context.CartItems.AddAsync(cartItem);
            
            // Обновляем время последнего изменения корзины
            var cart = await _context.Carts.FindAsync(cartId);
            if (cart != null)
            {
                cart.UpdatedAt = DateTime.UtcNow;
                _context.Carts.Update(cart);
            }
            
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveItemFromCartAsync(Guid cartItemId)
        {
            var cartItem = await _context.CartItems.FindAsync(cartItemId);
            if (cartItem == null) return false;

            _context.CartItems.Remove(cartItem);
            
            // Обновляем время последнего изменения корзины
            var cart = await _context.Carts.FindAsync(cartItem.CartId);
            if (cart != null)
            {
                cart.UpdatedAt = DateTime.UtcNow;
                _context.Carts.Update(cart);
            }
            
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ClearCartAsync(Guid cartId)
        {
            var cartItems = await _context.CartItems
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            
            // Обновляем время последнего изменения корзины
            var cart = await _context.Carts.FindAsync(cartId);
            if (cart != null)
            {
                cart.UpdatedAt = DateTime.UtcNow;
                _context.Carts.Update(cart);
            }
            
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> CreateCartAsync(Cart cart)
        {
            await _context.Carts.AddAsync(cart);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}