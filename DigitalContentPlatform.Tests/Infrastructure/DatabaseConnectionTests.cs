using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using Xunit;

namespace DigitalContentPlatform.Tests.Infrastructure
{
    public class DatabaseConnectionTests
    {
        [Fact]
        public void CanConnectToDatabase()
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

            // Act & Assert
            using var context = new ApplicationDbContext(options);
            Assert.True(context.Database.CanConnect());
        }
    }
}