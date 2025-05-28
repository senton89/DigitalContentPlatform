using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class SharedContentService : ISharedContentService
    {
        private readonly ISharedContentRepository _repository;
        private readonly IFileService _fileService;
        
        public SharedContentService(ISharedContentRepository repository, IFileService fileService)
        {
            _repository = repository;
            _fileService = fileService;
        }

        public async Task<IEnumerable<SharedContentDto>> GetAllAsync(int page = 1, int pageSize = 10)
        {
            return await _repository.GetAllAsync(page, pageSize);
        }

        public async Task<SharedContentDto> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Guid> CreateAsync(CreateSharedContentDto dto)
        {
            if (dto.File == null)
                throw new ArgumentException("Файл не загружен");

            var fileUrl = await _fileService.SaveFileAsync(dto.File, "shared_content");

            // Теперь передаем и dto, и fileUrl
            return await _repository.CreateAsync(dto, fileUrl);
        }
    }
}