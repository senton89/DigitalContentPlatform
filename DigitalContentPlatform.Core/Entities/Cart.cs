using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.Entities
{
    public class Cart
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Навигационные свойства
        public User User { get; set; }
        public List<CartItem> Items { get; set; } = new List<CartItem>();
    }
}