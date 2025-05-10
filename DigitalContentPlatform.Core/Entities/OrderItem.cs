using System;

namespace DigitalContentPlatform.Core.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid DigitalItemId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        
        // Navigation properties
        public Order Order { get; set; }
        public DigitalItem DigitalItem { get; set; }
    }
}
