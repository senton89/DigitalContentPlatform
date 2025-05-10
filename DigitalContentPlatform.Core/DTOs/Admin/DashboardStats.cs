using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.DTOs.Admin
{
    public class DashboardStats
    {
        public int TotalUsers { get; set; }
        public int TotalItems { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<ChartData> UserRegistrationsByMonth { get; set; } = new List<ChartData>();
        public List<ChartData> SalesByMonth { get; set; } = new List<ChartData>();
        public List<CategoryStats> TopCategories { get; set; } = new List<CategoryStats>();
    }

    public class ChartData
    {
        public string Label { get; set; }
        public int Value { get; set; }
    }

    public class CategoryStats
    {
        public string CategoryName { get; set; }
        public int ItemCount { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
    }
}
