// src/api/digitalItemApi.ts (оптимизация)
import axiosInstance from './axiosConfig';
import {
  DigitalItemDto,
  DigitalItemCreateDto,
  DigitalItemUpdateDto,
  CategoryDto,
  PagedResult
} from '../types/digitalItem';
import { clientCache } from '../utils/cacheUtils';

const API_URL = '/Digitalitems';
const CACHE_TTL = 5; // 5 минут

export const digitalItemApi = {
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PagedResult<DigitalItemDto>> => {
    const cacheKey = `digitalItems_all_${page}_${pageSize}`;
    const cachedData = clientCache.get<PagedResult<DigitalItemDto>>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const response = await axiosInstance.get(`${API_URL}?page=${page}&pageSize=${pageSize}`);
    response.data.items = response.data.items.$values;
    clientCache.set(cacheKey, response.data, CACHE_TTL);
    return response.data;
  },
  
  getById: async (id: string): Promise<DigitalItemDto> => {
    const cacheKey = `digitalItem_${id}`;
    const cachedData = clientCache.get<DigitalItemDto>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    clientCache.set(cacheKey, response.data, CACHE_TTL);
    return response.data;
  },
  
  getByCategory: async (categoryId: string, page: number = 1, pageSize: number = 10): Promise<PagedResult<DigitalItemDto>> => {
    const cacheKey = `digitalItems_category_${categoryId}_${page}_${pageSize}`;
    const cachedData = clientCache.get<PagedResult<DigitalItemDto>>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axiosInstance.get(`${API_URL}/category/${categoryId}?page=${page}&pageSize=${pageSize}`);
    response.data.items = response.data.items.$values;
    clientCache.set(cacheKey, response.data, CACHE_TTL);
    return response.data.$values || response.data;
  },
  
  getByUser: async (page: number = 1, pageSize: number = 10): Promise<PagedResult<DigitalItemDto>> => {
    // Не кэшируем данные пользователя, так как они могут часто меняться
    const response = await axiosInstance.get(`${API_URL}/user?&page=${page}&pageSize=${pageSize}`);
    response.data.items = response.data.items.$values;
    return response.data.$values || response.data;
  },
  
  create: async (data: DigitalItemCreateDto): Promise<any> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('categoryId', data.categoryId);
    if (data.file) formData.append('file', data.file);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    
    const response = await axiosInstance.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Инвалидируем кэш после создания нового элемента
    clientCache.clearByPrefix('digitalItems_');
    
    return response.data;
  },
  
  update: async (id: string, data: DigitalItemUpdateDto): Promise<any> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('categoryId', data.categoryId);
    formData.append('status', data.status);
    if (data.file) formData.append('file', data.file);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    
    const response = await axiosInstance.put(`${API_URL}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Инвалидируем кэш после обновления элемента
    clientCache.remove(`digitalItem_${id}`);
    clientCache.clearByPrefix('digitalItems_');
    
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_URL}/${id}`);
    
    // Инвалидируем кэш после удаления элемента
    clientCache.remove(`digitalItem_${id}`);
    clientCache.clearByPrefix('digitalItems_');
  }
};

export const categoryApi = {
  getAll: async (): Promise<CategoryDto[]> => {
    const cacheKey = 'categories_all';
    const cachedData = clientCache.get<CategoryDto[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axiosInstance.get('/categories');
    const categoriesData = response.data.$values || response.data;
    const categories = Array.isArray(categoriesData) ? categoriesData : [];
    clientCache.set(cacheKey, categories, 60); // Кэшируем на 60 минут, так как категории редко меняются
    return categories;
  },
  
  getById: async (id: string): Promise<CategoryDto> => {
    const cacheKey = `category_${id}`;
    const cachedData = clientCache.get<CategoryDto>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axiosInstance.get(`/categories/${id}`);
    clientCache.set(cacheKey, response.data, 60);
    return response.data;
  }
};