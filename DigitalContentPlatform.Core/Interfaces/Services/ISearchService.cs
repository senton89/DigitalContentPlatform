using DigitalContentPlatform.Core.DTOs;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface ISearchService
    {
        Task<PagedResult<DigitalItemDto>> SearchDigitalItemsAsync(string query, int page, int pageSize);
        Task<PagedResult<DigitalItemDto>> FilterDigitalItemsAsync(FilterParams filterParams);
    }
}
