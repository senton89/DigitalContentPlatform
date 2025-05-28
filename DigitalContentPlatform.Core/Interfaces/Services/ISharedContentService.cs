using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DigitalContentPlatform.Core.DTOs;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface ISharedContentService
    {
        Task<IEnumerable<SharedContentDto>> GetAllAsync(int page = 1, int pageSize = 10);
        Task<SharedContentDto> GetByIdAsync(Guid id);
        Task<Guid> CreateAsync(CreateSharedContentDto dto);
    }
}