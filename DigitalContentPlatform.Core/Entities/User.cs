using System;
using System.Collections.Generic;

namespace DigitalContentPlatform.Core.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public string Role { get; set; } = "User";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        
        // Навигационные свойства
        public ICollection<DigitalItem> Items { get; set; } = new List<DigitalItem>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
