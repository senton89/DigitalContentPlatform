// DigitalContentPlatform.Core/DTOs/PagedResult.cs
using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.DTOs
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; }
        public int TotalItems { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
