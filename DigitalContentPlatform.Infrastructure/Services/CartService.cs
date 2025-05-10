using AutoMapper;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IDigitalItemRepository _digitalItemRepository;
        private readonly IMapper _mapper;

        public CartService(
            ICartRepository cartRepository,
            IDigitalItemRepository digitalItemRepository,
            IMapper mapper)
        {
            _cartRepository = cartRepository;
            _digitalItemRepository = digitalItemRepository;
            _mapper = mapper;
        }

        public async Task<CartDto> GetCartAsync(Guid userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            
            if (cart == null)
            {
                // Создаем новую корзину для пользователя
                cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                await _cartRepository.CreateCartAsync(cart);
                return new CartDto
                {
                    Id = cart.Id,
                    Items = new List<CartItemDto>(),
                    TotalPrice = 0,
                    ItemCount = 0
                };
            }
            
            var cartDto = new CartDto
            {
                Id = cart.Id,
                Items = cart.Items.Select(item => new CartItemDto
                {
                    Id = item.Id,
                    DigitalItemId = item.DigitalItemId,
                    Title = item.DigitalItem.Title,
                    Description = item.DigitalItem.Description,
                    Price = item.Price,
                    ThumbnailUrl = item.DigitalItem.ThumbnailUrl,
                    AddedAt = item.AddedAt
                }).ToList(),
                TotalPrice = cart.Items.Sum(item => item.Price),
                ItemCount = cart.Items.Count
            };
            
            return cartDto;
        }

        public async Task<CartDto> AddToCartAsync(Guid userId, Guid digitalItemId)
        {
            // Получаем корзину пользователя
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            
            if (cart == null)
            {
                // Создаем новую корзину для пользователя
                cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                await _cartRepository.CreateCartAsync(cart);
            }
            
            // Проверяем, существует ли товар
            var digitalItem = await _digitalItemRepository.GetByIdAsync(digitalItemId);
            if (digitalItem == null)
            {
                throw new ArgumentException("Digital item not found");
            }
            
            // Проверяем, не добавлен ли уже этот товар в корзину
            if (cart.Items.Any(i => i.DigitalItemId == digitalItemId))
            {
                // Товар уже в корзине, просто возвращаем текущую корзину
                return await GetCartAsync(userId);
            }
            
            // Добавляем товар в корзину
            await _cartRepository.AddItemToCartAsync(cart.Id, digitalItemId, digitalItem.Price);
            
            // Возвращаем обновленную корзину
            return await GetCartAsync(userId);
        }

        public async Task<CartDto> RemoveFromCartAsync(Guid userId, Guid cartItemId)
        {
            // Получаем корзину пользователя
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            
            if (cart == null)
            {
                throw new ArgumentException("Cart not found");
            }
            
            // Проверяем, принадлежит ли элемент корзины данному пользователю
            var cartItem = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
            if (cartItem == null)
            {
                throw new ArgumentException("Cart item not found");
            }
            
            // Удаляем элемент из корзины
            await _cartRepository.RemoveItemFromCartAsync(cartItemId);
            
            // Возвращаем обновленную корзину
            return await GetCartAsync(userId);
        }

        public async Task<bool> ClearCartAsync(Guid userId)
        {
            // Получаем корзину пользователя
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            
            if (cart == null)
            {
                return false;
            }
            
            // Очищаем корзину
            return await _cartRepository.ClearCartAsync(cart.Id);
        }
    }
}