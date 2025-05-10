using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Linq;
using Xunit;

namespace DigitalContentPlatform.Tests.Infrastructure
{
    public class MigrationTests
    {
        [Fact]
        public void MigrationsAppliedCorrectly()
        {
            // Arrange
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseNpgsql(connectionString)
                .Options;

            // Act
            using var context = new ApplicationDbContext(options);
            var pendingMigrations = context.Database.GetPendingMigrations().ToList();
            
            // Assert
            Assert.Empty(pendingMigrations);
        }
    }
}