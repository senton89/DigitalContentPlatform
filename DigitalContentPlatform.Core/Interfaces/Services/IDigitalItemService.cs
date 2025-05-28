using DigitalContentPlatform.Core.DTOs;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface IDigitalItemService
    {
       Task<DigitalItemResult> CreateAsync(DigitalItemCreateDto dto, Guid userId, string imageUrl);
        Task<DigitalItemResult> UpdateAsync(Guid id, DigitalItemUpdateDto dto, Guid userId);
        Task<DigitalItemResult> DeleteAsync(Guid id, Guid userId);
        Task<DigitalItemDto> GetByIdAsync(Guid id);
        Task<PagedResult<DigitalItemDto>> GetAllAsync(int page, int pageSize);
        Task<PagedResult<DigitalItemDto>> GetByCategoryAsync(Guid categoryId, int page, int pageSize);
        Task<PagedResult<DigitalItemDto>> GetByUserAsync(Guid userId, int page, int pageSize);
        Task<DigitalItemResult> AdminDeleteAsync(Guid id);
    }
}
