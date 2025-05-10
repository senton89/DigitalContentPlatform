// DigitalContentPlatform.Core/DTOs/CategoryDto.cs
using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.DTOs
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public string ParentCategoryName { get; set; }
        public List<CategoryDto> SubCategories { get; set; } = new List<CategoryDto>();
    }
}
