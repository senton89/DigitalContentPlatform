using DigitalContentPlatform.Core.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto> GetByIdAsync(Guid id);
    }
}