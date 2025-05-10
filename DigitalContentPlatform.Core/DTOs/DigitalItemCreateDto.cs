// DigitalContentPlatform.Core/DTOs/DigitalItemCreateDto.cs
using Microsoft.AspNetCore.Http;

namespace DigitalContentPlatform.Core.DTOs
{
    public class DigitalItemCreateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public Guid CategoryId { get; set; }
        public IFormFile File { get; set; }
        public IFormFile Thumbnail { get; set; }
    }
}
