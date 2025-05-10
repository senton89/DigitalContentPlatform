using System;

namespace DigitalContentPlatform.Core.Entities
{
    public class CartItem
    {
        public Guid Id { get; set; }
        public Guid CartId { get; set; }
        public Guid DigitalItemId { get; set; }
        public decimal Price { get; set; }
        public DateTime AddedAt { get; set; }
        
        // Навигационные свойства
        public Cart Cart { get; set; }
        public DigitalItem DigitalItem { get; set; }
    }
}