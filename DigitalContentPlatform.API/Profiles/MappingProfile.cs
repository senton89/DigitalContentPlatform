using AutoMapper;
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.DTOs.Admin;
using DigitalContentPlatform.Core.DTOs.Auth;
using DigitalContentPlatform.Core.Entities;

namespace DigitalContentPlatform.API.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Digital Item mappings
            CreateMap<DigitalItem, DigitalItemDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.CreatorUsername, opt => opt.MapFrom(src => src.User.Username));

            CreateMap<PagedResult<DigitalItem>, PagedResult<DigitalItemDto>>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

            // Category mappings
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.ParentCategoryName, opt => opt.MapFrom(src => src.ParentCategory != null ? src.ParentCategory.Name : null))
                .ForMember(dest => dest.SubCategories, opt => opt.MapFrom(src => src.SubCategories));

            // User mappings
            CreateMap<User, UserDto>();
        }
    }
}