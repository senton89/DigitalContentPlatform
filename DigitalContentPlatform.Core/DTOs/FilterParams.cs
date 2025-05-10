using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.DTOs
{
    public class FilterParams
    {
        public string SearchQuery { get; set; }
        public Guid? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string SortBy { get; set; } = "CreatedAt"; // Default sort by creation date
        public bool SortDescending { get; set; } = true; // Default sort descending
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
