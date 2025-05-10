// DigitalContentPlatform.Core/DTOs/DigitalItemUpdateDto.cs
using Microsoft.AspNetCore.Http;
using System;

namespace DigitalContentPlatform.Core.DTOs
{
    public class DigitalItemUpdateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public Guid CategoryId { get; set; }
        public IFormFile File { get; set; }
        public IFormFile Thumbnail { get; set; }
        public string Status { get; set; }
    }
}
