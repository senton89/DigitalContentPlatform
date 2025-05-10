// DigitalContentPlatform.Core/DTOs/DigitalItemDto.cs
using System;

namespace DigitalContentPlatform.Core.DTOs
{
    public class DigitalItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ThumbnailUrl { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; }
        public Guid UserId { get; set; }
        public string CreatorUsername { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Status { get; set; }
    }
}
