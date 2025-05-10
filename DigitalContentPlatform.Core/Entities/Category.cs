// DigitalContentPlatform.Core/Entities/Category.cs
using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.Entities
{
    public class Category
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public Category ParentCategory { get; set; }
        public ICollection<Category> SubCategories { get; set; } = new List<Category>();
        public ICollection<DigitalItem> DigitalItems { get; set; } = new List<DigitalItem>();
    }
}
