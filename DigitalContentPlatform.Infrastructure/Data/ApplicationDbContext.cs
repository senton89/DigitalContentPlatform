using DigitalContentPlatform.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigitalContentPlatform.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<DigitalItem> DigitalItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Настройка индексов и ограничений
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Настройка связей
            modelBuilder.Entity<DigitalItem>()
                .HasOne(d => d.Category)
                .WithMany(c => c.DigitalItems)
                .HasForeignKey(d => d.CategoryId);

            modelBuilder.Entity<DigitalItem>()
                .HasOne(d => d.User)
                .WithMany(u => u.Items)
                .HasForeignKey(d => d.UserId);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.DigitalItem)
                .WithMany()
                .HasForeignKey(oi => oi.DigitalItemId);
            
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(ci => ci.CartId);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.DigitalItem)
                .WithMany()
                .HasForeignKey(ci => ci.DigitalItemId);
        }
    }
}