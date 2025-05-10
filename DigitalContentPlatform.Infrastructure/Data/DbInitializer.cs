// DigitalContentPlatform.Infrastructure/Data/DbInitializer.cs
using DigitalContentPlatform.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;
            try
            {
                var context = services.GetRequiredService<ApplicationDbContext>();
                await context.Database.MigrateAsync();
                await SeedDataAsync(context);
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<ApplicationDbContext>>();
                logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }

        private static async Task SeedDataAsync(ApplicationDbContext context)
        {
            // Добавление категорий, если их нет
            if (!await context.Categories.AnyAsync())
            {
                var categories = new[]
                {
                    new Category { Id = Guid.NewGuid(), Name = "E-books", Description = "Digital books in various formats" },
                    new Category { Id = Guid.NewGuid(), Name = "Audio", Description = "Audio files including music and podcasts" },
                    new Category { Id = Guid.NewGuid(), Name = "Video", Description = "Video tutorials and courses" },
                    new Category { Id = Guid.NewGuid(), Name = "Software", Description = "Applications and software tools" }
                };

                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            // Добавление администратора, если его нет
            if (!await context.Users.AnyAsync(u => u.Role == "Admin"))
            {
                // В реальном приложении пароль должен быть хеширован
                // Это будет реализовано в сервисе аутентификации
                var admin = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "admin",
                    Email = "admin@example.com",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(admin);
                await context.SaveChangesAsync();
            }
        }
    }
}