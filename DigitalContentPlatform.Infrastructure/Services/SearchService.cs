using AutoMapper;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class SearchService : ISearchService
    {
        private readonly IDigitalItemRepository _digitalItemRepository;
        private readonly IMapper _mapper;

        public SearchService(
            IDigitalItemRepository digitalItemRepository,
            IMapper mapper)
        {
            _digitalItemRepository = digitalItemRepository;
            _mapper = mapper;
        }

        public async Task<PagedResult<DigitalItemDto>> SearchDigitalItemsAsync(string query, int page, int pageSize)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                var allItems = await _digitalItemRepository.GetAllAsync(page, pageSize);
                return new PagedResult<DigitalItemDto>
                {
                    Items = _mapper.Map<List<DigitalItemDto>>(allItems.Items),
                    TotalItems = allItems.TotalItems,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = allItems.TotalPages
                };
            }

            var result = await _digitalItemRepository.SearchAsync(query, page, pageSize);
            return new PagedResult<DigitalItemDto>
            {
                Items = _mapper.Map<List<DigitalItemDto>>(result.Items),
                TotalItems = result.TotalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = result.TotalPages
            };
        }

        public async Task<PagedResult<DigitalItemDto>> FilterDigitalItemsAsync(FilterParams filterParams)
        {
            var result = await _digitalItemRepository.FilterAsync(filterParams);
            return _mapper.Map<PagedResult<DigitalItemDto>>(result);
        }
    }
}
