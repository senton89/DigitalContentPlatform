using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class SharedContentRepository : ISharedContentRepository
    {
        private readonly ApplicationDbContext _context;

        public SharedContentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SharedContentDto>> GetAllAsync(int page, int pageSize)
        {
            return await _context.SharedContents
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new SharedContentDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Url = c.Url,
                    ContentType = c.ContentType,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<SharedContentDto> GetByIdAsync(Guid id)
        {
            var content = await _context.SharedContents.FindAsync(id);
            if (content == null) return null;

            return new SharedContentDto
            {
                Id = content.Id,
                Title = content.Title,
                Description = content.Description,
                Url = content.Url,
                ContentType = content.ContentType,
                CreatedAt = content.CreatedAt
            };
        }

        public async Task<Guid> CreateAsync(CreateSharedContentDto dto, string fileUrl)
        {
            var content = new SharedContent
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Url = fileUrl,
                ContentType = Path.GetExtension(dto.File.FileName).ToLower() switch
                {
                    ".jpg" or ".jpeg" => "image",
                    ".mp4" or ".webm" => "video",
                    ".pdf" => "document",
                    _ => "unknown"
                },
                CreatedAt = DateTime.UtcNow
            };

            await _context.SharedContents.AddAsync(content);
            await _context.SaveChangesAsync();

            return content.Id;
        }
    }
}