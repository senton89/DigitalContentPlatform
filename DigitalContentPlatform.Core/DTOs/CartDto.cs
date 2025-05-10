using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.DTOs
{
    public class CartDto
    {
        public Guid Id { get; set; }
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
        public decimal TotalPrice { get; set; }
        public int ItemCount { get; set; }
    }

    public class CartItemDto
    {
        public Guid Id { get; set; }
        public Guid DigitalItemId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ThumbnailUrl { get; set; }
        public DateTime AddedAt { get; set; }
    }

    public class AddToCartDto
    {
        public Guid DigitalItemId { get; set; }
    }

    public class RemoveFromCartDto
    {
        public Guid CartItemId { get; set; }
    }
}