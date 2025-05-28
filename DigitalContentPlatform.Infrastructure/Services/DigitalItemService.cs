// DigitalContentPlatform.Infrastructure/Services/DigitalItemService.cs
using AutoMapper;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class DigitalItemService : IDigitalItemService
    {
        private readonly IDigitalItemRepository _digitalItemRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IFileService _fileService;
        private readonly IMapper _mapper;

        public DigitalItemService(
            IDigitalItemRepository digitalItemRepository,
            ICategoryRepository categoryRepository,
            IFileService fileService,
            IMapper mapper)
        {
            _digitalItemRepository = digitalItemRepository;
            _categoryRepository = categoryRepository;
            _fileService = fileService;
            _mapper = mapper;
        }

        public async Task<DigitalItemResult> CreateAsync(DigitalItemCreateDto dto, Guid userId, string imageUrl)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return new DigitalItemResult { Success = false, Message = "Category not found" };

            var filePath = await _fileService.SaveFileAsync(dto.File, "items");
            // var thumbnailPath = await _fileService.SaveFileAsync(dto.Thumbnail, "thumbnails");

            var digitalItem = new DigitalItem
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                FileUrl = filePath,
                ThumbnailUrl = imageUrl,
                CategoryId = dto.CategoryId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "Active"
            };

            var result = await _digitalItemRepository.CreateAsync(digitalItem);
            if (!result)
                return new DigitalItemResult { Success = false, Message = "Failed to create digital item" };

            return new DigitalItemResult { Success = true, Id = digitalItem.Id, Message = "Digital item created successfully" };
        }

        public async Task<DigitalItemResult> UpdateAsync(Guid id, DigitalItemUpdateDto dto, Guid userId)
        {
            var item = await _digitalItemRepository.GetByIdAsync(id);
            if (item == null)
                return new DigitalItemResult { Success = false, Message = "Digital item not found" };

            if (item.UserId != userId)
                return new DigitalItemResult { Success = false, Message = "Unauthorized to update this item" };

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return new DigitalItemResult { Success = false, Message = "Category not found" };

            item.Title = dto.Title;
            item.Description = dto.Description;
            item.Price = dto.Price;
            item.CategoryId = dto.CategoryId;
            item.Status = dto.Status;
            item.UpdatedAt = DateTime.UtcNow;

            if (dto.File != null)
            {
                await _fileService.DeleteFileAsync(item.FileUrl);
                item.FileUrl = await _fileService.SaveFileAsync(dto.File, "items");
            }

            if (dto.Thumbnail != null)
            {
                await _fileService.DeleteFileAsync(item.ThumbnailUrl);
                item.ThumbnailUrl = await _fileService.SaveFileAsync(dto.Thumbnail, "thumbnails");
            }

            var result = await _digitalItemRepository.UpdateAsync(item);
            if (!result)
                return new DigitalItemResult { Success = false, Message = "Failed to update digital item" };

            return new DigitalItemResult { Success = true, Id = item.Id, Message = "Digital item updated successfully" };
        }

        public async Task<DigitalItemResult> DeleteAsync(Guid id, Guid userId)
        {
            var item = await _digitalItemRepository.GetByIdAsync(id);
            if (item == null)
                return new DigitalItemResult { Success = false, Message = "Digital item not found" };

            if (item.UserId != userId)
                return new DigitalItemResult { Success = false, Message = "Unauthorized to delete this item" };

            await _fileService.DeleteFileAsync(item.FileUrl);
            await _fileService.DeleteFileAsync(item.ThumbnailUrl);

            var result = await _digitalItemRepository.DeleteAsync(id);
            if (!result)
                return new DigitalItemResult { Success = false, Message = "Failed to delete digital item" };

            return new DigitalItemResult { Success = true, Id = id, Message = "Digital item deleted successfully" };
        }

        public async Task<DigitalItemDto> GetByIdAsync(Guid id)
        {
            var item = await _digitalItemRepository.GetByIdAsync(id);
            if (item == null)
                return null;

            return _mapper.Map<DigitalItemDto>(item);
        }

        public async Task<PagedResult<DigitalItemDto>> GetAllAsync(int page, int pageSize)
        {
            var result = await _digitalItemRepository.GetAllAsync(page, pageSize);
            return _mapper.Map<PagedResult<DigitalItemDto>>(result);
        }

        public async Task<PagedResult<DigitalItemDto>> GetByCategoryAsync(Guid categoryId, int page, int pageSize)
        {
            var result = await _digitalItemRepository.GetByCategoryAsync(categoryId, page, pageSize);
            return _mapper.Map<PagedResult<DigitalItemDto>>(result);
        }

        public async Task<PagedResult<DigitalItemDto>> GetByUserAsync(Guid userId, int page, int pageSize)
        {
            var result = await _digitalItemRepository.GetByUserAsync(userId, page, pageSize);
            return _mapper.Map<PagedResult<DigitalItemDto>>(result);
        }
        
        public async Task<DigitalItemResult> AdminDeleteAsync(Guid id)
        {
            var item = await _digitalItemRepository.GetByIdAsync(id);
            if (item == null)
                return new DigitalItemResult { Success = false, Message = "Digital item not found" };

            await _fileService.DeleteFileAsync(item.FileUrl);
            await _fileService.DeleteFileAsync(item.ThumbnailUrl);

            var result = await _digitalItemRepository.DeleteAsync(id);
            if (!result)
                return new DigitalItemResult { Success = false, Message = "Failed to delete digital item" };

            return new DigitalItemResult { Success = true, Id = id, Message = "Digital item deleted successfully" };
        }
    }
}
