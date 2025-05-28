using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs;

namespace DigitalContentPlatform.Core.Interfaces.Repositories
{
    public interface ISharedContentRepository
    {
        Task<IEnumerable<SharedContentDto>> GetAllAsync(int page, int pageSize);
        Task<SharedContentDto> GetByIdAsync(Guid id);
        Task<Guid> CreateAsync(CreateSharedContentDto dto, string fileUrl);
    }
}