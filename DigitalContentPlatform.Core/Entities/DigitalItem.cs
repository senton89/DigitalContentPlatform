// DigitalContentPlatform.Core/Entities/DigitalItem.cs
using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.Entities
{
    public class DigitalItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string FileUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Active"; // Active, Draft, Archived
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
