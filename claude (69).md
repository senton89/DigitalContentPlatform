# Этап 7: Оптимизация и улучшение производительности

В этом этапе мы сосредоточимся на оптимизации и улучшении производительности нашей платформы управления цифровым контентом. Мы оптимизируем запросы к базе данных, внедрим кэширование, улучшим производительность клиентской части и проведем тестирование производительности.

## 7.1. Оптимизация запросов к базе данных

### 7.1.1. Добавление индексов для часто используемых полей

Начнем с добавления индексов для часто используемых полей в базе данных, чтобы ускорить выполнение запросов:

```csharp
// DigitalContentPlatform.Infrastructure/Data/Migrations/AddIndexesMigration.cs
using Microsoft.EntityFrameworkCore.Migrations;

namespace DigitalContentPlatform.Infrastructure.Data.Migrations
{
    public partial class AddIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Индекс для поиска по названию и описанию цифрового контента
            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_Title",
                table: "DigitalItems",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_Description",
                table: "DigitalItems",
                column: "Description");

            // Индекс для фильтрации по цене
            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_Price",
                table: "DigitalItems",
                column: "Price");

            // Индекс для фильтрации по статусу
            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_Status",
                table: "DigitalItems",
                column: "Status");

            // Индекс для сортировки по дате создания
            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_CreatedAt",
                table: "DigitalItems",
                column: "CreatedAt");

            // Индекс для заказов по дате создания
            migrationBuilder.CreateIndex(
                name: "IX_Orders_CreatedAt",
                table: "Orders",
                column: "CreatedAt");

            // Индекс для пользователей по дате регистрации
            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedAt",
                table: "Users",
                column: "CreatedAt");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_Title",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_Description",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_Price",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_Status",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_CreatedAt",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CreatedAt",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Users_CreatedAt",
                table: "Users");
        }
    }
}
```

### 7.1.2. Оптимизация запросов с использованием кэширования

Создадим интерфейс для кэш-сервиса:

```csharp
// DigitalContentPlatform.Core/Interfaces/Services/ICacheService.cs
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface ICacheService
    {
        Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null);
        Task RemoveAsync(string key);
        Task RemoveByPrefixAsync(string prefix);
    }
}
```

Реализуем кэш-сервис с использованием `IMemoryCache`:

```csharp
// DigitalContentPlatform.Infrastructure/Services/MemoryCacheService.cs
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ConcurrentDictionary<string, bool> _keys = new ConcurrentDictionary<string, bool>();

        public MemoryCacheService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
        {
            if (_cache.TryGetValue(key, out T cachedValue))
            {
                return cachedValue;
            }

            var value = await factory();

            var cacheOptions = new MemoryCacheEntryOptions();
            if (expiration.HasValue)
            {
                cacheOptions.SetAbsoluteExpiration(expiration.Value);
            }
            else
            {
                cacheOptions.SetAbsoluteExpiration(TimeSpan.FromMinutes(10)); // Default expiration
            }

            _cache.Set(key, value, cacheOptions);
            _keys.TryAdd(key, true);

            return value;
        }

        public Task RemoveAsync(string key)
        {
            _cache.Remove(key);
            _keys.TryRemove(key, out _);
            return Task.CompletedTask;
        }

        public Task RemoveByPrefixAsync(string prefix)
        {
            var keysToRemove = _keys.Keys.Where(k => k.StartsWith(prefix)).ToList();
            
            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
                _keys.TryRemove(key, out _);
            }

            return Task.CompletedTask;
        }
    }
}
```

Создадим декоратор для репозитория цифрового контента с кэшированием:

```csharp
// DigitalContentPlatform.Infrastructure/Repositories/CachedDigitalItemRepository.cs
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class CachedDigitalItemRepository : IDigitalItemRepository
    {
        private readonly IDigitalItemRepository _repository;
        private readonly ICacheService _cacheService;
        private const string CacheKeyPrefix = "digitalItem_";

        public CachedDigitalItemRepository(
            IDigitalItemRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<bool> CreateAsync(DigitalItem item)
        {
            var result = await _repository.CreateAsync(item);
            if (result)
            {
                // Инвалидируем кэш для списков, так как добавлен новый элемент
                await _cacheService.RemoveByPrefixAsync("digitalItems_list");
            }
            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var result = await _repository.DeleteAsync(id);
            if (result)
            {
                // Удаляем элемент из кэша и инвалидируем кэш для списков
                await _cacheService.RemoveAsync($"{CacheKeyPrefix}{id}");
                await _cacheService.RemoveByPrefixAsync("digitalItems_list");
            }
            return result;
        }

        public async Task<PagedResult<DigitalItem>> FilterAsync(FilterParams filterParams)
        {
            // Создаем уникальный ключ для кэша на основе параметров фильтрации
            var cacheKey = $"digitalItems_filter_{filterParams.SearchQuery}_{filterParams.CategoryId}_{filterParams.MinPrice}_{filterParams.MaxPrice}_{filterParams.SortBy}_{filterParams.SortDescending}_{filterParams.Page}_{filterParams.PageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.FilterAsync(filterParams),
                TimeSpan.FromMinutes(5));
        }

        public async Task<PagedResult<DigitalItem>> GetAllAsync(int page, int pageSize)
        {
            var cacheKey = $"digitalItems_list_all_{page}_{pageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetAllAsync(page, pageSize),
                TimeSpan.FromMinutes(5));
        }

        public async Task<PagedResult<DigitalItem>> GetByCategoryAsync(Guid categoryId, int page, int pageSize)
        {
            var cacheKey = $"digitalItems_list_category_{categoryId}_{page}_{pageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetByCategoryAsync(categoryId, page, pageSize),
                TimeSpan.FromMinutes(5));
        }

        public async Task<DigitalItem> GetByIdAsync(Guid id)
        {
            var cacheKey = $"{CacheKeyPrefix}{id}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetByIdAsync(id),
                TimeSpan.FromMinutes(10));
        }

        public async Task<PagedResult<DigitalItem>> GetByUserAsync(Guid userId, int page, int pageSize)
        {
            var cacheKey = $"digitalItems_list_user_{userId}_{page}_{pageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetByUserAsync(userId, page, pageSize),
                TimeSpan.FromMinutes(5));
        }

        public async Task<int> GetTotalCountAsync()
        {
            var cacheKey = "digitalItems_count";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetTotalCountAsync(),
                TimeSpan.FromMinutes(15));
        }

        public async Task<PagedResult<DigitalItem>> SearchAsync(string query, int page, int pageSize)
        {
            var cacheKey = $"digitalItems_search_{query}_{page}_{pageSize}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.SearchAsync(query, page, pageSize),
                TimeSpan.FromMinutes(5));
        }

        public async Task<bool> UpdateAsync(DigitalItem item)
        {
            var result = await _repository.UpdateAsync(item);
            if (result)
            {
                // Обновляем кэш для конкретного элемента и инвалидируем кэш для списков
                await _cacheService.RemoveAsync($"{CacheKeyPrefix}{item.Id}");
                await _cacheService.RemoveByPrefixAsync("digitalItems_list");
            }
            return result;
        }
    }
}
```

Аналогично создадим кэширующие декораторы для других репозиториев:

```csharp
// DigitalContentPlatform.Infrastructure/Repositories/CachedCategoryRepository.cs
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class CachedCategoryRepository : ICategoryRepository
    {
        private readonly ICategoryRepository _repository;
        private readonly ICacheService _cacheService;
        private const string CacheKeyPrefix = "category_";

        public CachedCategoryRepository(
            ICategoryRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<bool> CreateAsync(Category category)
        {
            var result = await _repository.CreateAsync(category);
            if (result)
            {
                await _cacheService.RemoveByPrefixAsync("categories_");
            }
            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var result = await _repository.DeleteAsync(id);
            if (result)
            {
                await _cacheService.RemoveAsync($"{CacheKeyPrefix}{id}");
                await _cacheService.RemoveByPrefixAsync("categories_");
            }
            return result;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            var cacheKey = "categories_all";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetAllAsync(),
                TimeSpan.FromHours(1)); // Категории меняются редко, можно кэшировать дольше
        }

        public async Task<Category> GetByIdAsync(Guid id)
        {
            var cacheKey = $"{CacheKeyPrefix}{id}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetByIdAsync(id),
                TimeSpan.FromHours(1));
        }

        public async Task<List<CategoryStats>> GetTopCategoriesAsync(int count)
        {
            var cacheKey = $"categories_top_{count}";
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _repository.GetTopCategoriesAsync(count),
                TimeSpan.FromMinutes(30));
        }

        public async Task<bool> UpdateAsync(Category category)
        {
            var result = await _repository.UpdateAsync(category);
            if (result)
            {
                await _cacheService.RemoveAsync($"{CacheKeyPrefix}{category.Id}");
                await _cacheService.RemoveByPrefixAsync("categories_");
            }
            return result;
        }
    }
}
```

### 7.1.3. Оптимизация запросов с использованием проекций

Оптимизируем запросы, используя проекции для выборки только необходимых данных:

```csharp
// DigitalContentPlatform.Infrastructure/Repositories/DigitalItemRepository.cs (оптимизация)
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class DigitalItemRepository : IDigitalItemRepository
    {
        // Существующий код...

        // Оптимизированный метод GetAllAsync с проекцией
        public async Task<PagedResult<DigitalItem>> GetAllAsync(int page, int pageSize)
        {
            // Сначала получаем только идентификаторы для пагинации
            var query = _context.DigitalItems
                .AsNoTracking()
                .Where(d => d.Status == "Active")
                .OrderByDescending(d => d.CreatedAt);

            var totalItems = await query.CountAsync();
            
            // Затем получаем только нужные данные для отображения в списке
            var itemIds = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => d.Id)
                .ToListAsync();

            // Загружаем полные данные только для выбранных идентификаторов
            var items = await _context.DigitalItems
                .AsNoTracking()
                .Include(d => d.Category)
                .Include(d => d.User)
                .Where(d => itemIds.Contains(d.Id))
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        // Оптимизированный метод SearchAsync с проекцией
        public async Task<PagedResult<DigitalItem>> SearchAsync(string query, int page, int pageSize)
        {
            query = query.ToLower();

            // Сначала получаем только идентификаторы для пагинации
            var queryable = _context.DigitalItems
                .AsNoTracking()
                .Where(d => d.Status == "Active" && 
                    (d.Title.ToLower().Contains(query) || 
                     d.Description.ToLower().Contains(query) || 
                     d.Category.Name.ToLower().Contains(query) || 
                     d.User.Username.ToLower().Contains(query)))
                .OrderByDescending(d => d.CreatedAt);

            var totalItems = await queryable.CountAsync();
            
            // Затем получаем только нужные данные для отображения в списке
            var itemIds = await queryable
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => d.Id)
                .ToListAsync();

            // Загружаем полные данные только для выбранных идентификаторов
            var items = await _context.DigitalItems
                .AsNoTracking()
                .Include(d => d.Category)
                .Include(d => d.User)
                .Where(d => itemIds.Contains(d.Id))
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        // Аналогично оптимизируем другие методы...
    }
}
```

### 7.1.4. Регистрация кэширующих репозиториев в DI-контейнере

```csharp
// DigitalContentPlatform.API/Startup.cs (дополнение)
public void ConfigureServices(IServiceCollection services)
{
    // Существующий код...

    // Регистрация кэш-сервиса
    services.AddMemoryCache();
    services.AddSingleton<ICacheService, MemoryCacheService>();

    // Регистрация репозиториев с кэшированием
    services.AddScoped<IDigitalItemRepository, DigitalItemRepository>();
    services.AddScoped<ICategoryRepository, CategoryRepository>();
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IOrderRepository, OrderRepository>();

    // Декорирование репозиториев кэширующими декораторами
    services.Decorate<IDigitalItemRepository, CachedDigitalItemRepository>();
    services.Decorate<ICategoryRepository, CachedCategoryRepository>();

    // Существующий код...
}
```

## 7.2. Оптимизация клиентской части

### 7.2.1. Внедрение ленивой загрузки компонентов

Оптимизируем клиентскую часть, используя ленивую загрузку компонентов:

```typescript
// src/App.tsx (оптимизация)
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

// Ленивая загрузка страниц
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const DigitalItemDetailsPage = lazy(() => import('./pages/DigitalItemDetailsPage'));
const CreateItemPage = lazy(() => import('./pages/CreateItemPage'));
const EditItemPage = lazy(() => import('./pages/EditItemPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/items/:id" element={<DigitalItemDetailsPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Защищенные маршруты */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<div>Profile Page</div>} />
              <Route path="/create-item" element={<CreateItemPage />} />
              <Route path="/edit-item/:id" element={<EditItemPage />} />
            </Route>

            {/* Защищенные маршруты для администраторов */}
            <Route element={<ProtectedRoute requiredRole="Admin" />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/content" element={<AdminContentPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;
```

Создадим компонент LoadingSpinner:

```tsx
// src/components/common/LoadingSpinner.tsx
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
```

```css
/* src/components/common/LoadingSpinner.css */
.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 300px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### 7.2.2. Оптимизация размера бандла

Создадим конфигурацию для оптимизации размера бандла:

```javascript
// craco.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Анализ бандла только в режиме разработки
      if (env === 'development') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true,
          })
        );
      }

      // Сжатие файлов в режиме продакшн
      if (env === 'production') {
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
          })
        );
      }

      // Разделение кода на чанки
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          name: false,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Получаем имя пакета из node_modules
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1];
                return `npm.${packageName.replace('@', '')}`;
              },
            },
          },
        },
      };

      return webpackConfig;
    },
  },
};
```

Установим необходимые пакеты:

```bash
npm install --save-dev @craco/craco webpack-bundle-analyzer compression-webpack-plugin
```

Обновим package.json:

```json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test",
    "analyze": "REACT_APP_BUNDLE_ANALYZER=true craco build"
  }
}
```

### 7.2.3. Внедрение кэширования на клиенте

Создадим утилиту для кэширования данных на клиенте:

```typescript
// src/utils/cacheUtils.ts
interface CacheItem<T> {
  value: T;
  expiry: number;
}

export class ClientCache {
  private static instance: ClientCache;
  private cache: Map<string, CacheItem<any>> = new Map();

  private constructor() {}

  public static getInstance(): ClientCache {
    if (!ClientCache.instance) {
      ClientCache.instance = new ClientCache();
    }
    return ClientCache.instance;
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Если элемент не найден или срок его действия истек
    if (!item || Date.now() > item.expiry) {
      if (item) {
        this.cache.delete(key);
      }
      return null;
    }
    
    return item.value;
  }

  public set<T>(key: string, value: T, ttlMinutes: number = 5): void {
    const expiry = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, { value, expiry });
  }

  public remove(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public clearByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const clientCache = ClientCache.getInstance();
```

Обновим API-клиент для использования кэша:

```typescript
// src/api/digitalItemApi.ts (оптимизация)
import axiosInstance from './axiosConfig';
import { DigitalItemDto, DigitalItemCreateDto, DigitalItemUpdateDto, CategoryDto, PagedResult } from '../types/digitalItem';
import { clientCache } from '../utils/cacheUtils';

const API_URL = '/digitalitems';
const CACHE_TTL = 5; // 5 минут

export const digitalItemApi = {
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PagedResult<DigitalItemDto>> => {
    const cacheKey = `digitalItems_all_${page}_${pageSize}`;
    const cachedData = clientCache.get<PagedResult<DigitalItemDto>>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axiosInstance.get(`${API_URL}?page=${page}&pageSize=${pageSize}`);
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
    clientCache.set(cacheKey, response.data, CACHE_TTL);
    return response.data;
  },
  
  getByUser: async (page: number = 1, pageSize: number = 10): Promise<PagedResult<DigitalItemDto>> => {
    // Не кэшируем данные пользователя, так как они могут часто меняться
    const response = await axiosInstance.get(`${API_URL}/user?page=${page}&pageSize=${pageSize}`);
    return response.data;
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
    clientCache.set(cacheKey, response.data, 60); // Кэшируем на 60 минут, так как категории редко меняются
    return response.data;
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
```

### 7.2.4. Оптимизация рендеринга компонентов

Оптимизируем рендеринг компонентов с использованием React.memo и useCallback:

```tsx
// src/components/catalog/DigitalItemCard.tsx (оптимизация)
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DigitalItemDto } from '../../types/digitalItem';
import './DigitalItemCard.css';

interface DigitalItemCardProps {
  item: DigitalItemDto;
  onAddToCart?: (id: string) => void;
}

const DigitalItemCard: React.FC<DigitalItemCardProps> = React.memo(({ item, onAddToCart }) => {
  const navigate = useNavigate();

  const handleViewDetails = useCallback(() => {
    navigate(`/items/${item.id}`);
  }, [navigate, item.id]);

  const handleAddToCart = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(item.id);
    }
  }, [onAddToCart, item.id]);

  return (
    <div className="digital-item-card">
      <img src={item.thumbnailUrl} alt={item.title} className="item-thumbnail" />
      <div className="item-details">
        <h3>{item.title}</h3>
        <p className="item-description">{item.description.slice(0, 100)}...</p>
        <p className="item-price">${item.price.toFixed(2)}</p>
        <p className="item-creator">By: {item.creatorUsername}</p>
        <div className="item-actions">
          <button onClick={handleViewDetails} className="view-details-button">
            View Details
          </button>
          {onAddToCart && (
            <button onClick={handleAddToCart} className="add-to-cart-button">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default DigitalItemCard;
```

Оптимизируем компонент FilterPanel:

```tsx
// src/components/search/FilterPanel.tsx (оптимизация)
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setFilterParams, filterItems } from '../../store/slices/searchSlice';
import { categoryApi } from '../../api/digitalItemApi';
import { CategoryDto } from '../../types/digitalItem';
import { sortOptions } from '../../types/search';
import './FilterPanel.css';

const FilterPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { filterParams } = useSelector((state: RootState) => state.search);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localFilters, setLocalFilters] = useState({
    categoryId: filterParams.categoryId || '',
    minPrice: filterParams.minPrice?.toString() || '',
    maxPrice: filterParams.maxPrice?.toString() || '',
    sortOption: getSortOptionIndex(filterParams.sortBy || 'CreatedAt', filterParams.sortDescending || true)
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  function getSortOptionIndex(sortBy: string, sortDescending: boolean): number {
    if (sortBy === 'CreatedAt' && sortDescending) return 0;
    if (sortBy === 'CreatedAt' && !sortDescending) return 1;
    if (sortBy === 'Price' && sortDescending) return 2;
    if (sortBy === 'Price' && !sortDescending) return 3;
    if (sortBy === 'Title' && !sortDescending) return 4;
    if (sortBy === 'Title' && sortDescending) return 5;
    return 0; // Default
  }

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLocalFilters(prev => ({ ...prev, categoryId: value }));
  }, []);

  const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }));
  }, []);

  const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }));
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    setLocalFilters(prev => ({ ...prev, sortOption: index }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    const sortOption = sortOptions[localFilters.sortOption];
    const sortDescending = localFilters.sortOption === 0 || localFilters.sortOption === 2 || localFilters.sortOption === 5;

    const newFilterParams = {
      ...filterParams,
      categoryId: localFilters.categoryId ? localFilters.categoryId : undefined,
      minPrice: localFilters.minPrice ? parseFloat(localFilters.minPrice) : undefined,
      maxPrice: localFilters.maxPrice ? parseFloat(localFilters.maxPrice) : undefined,
      sortBy: sortOption.value,
      sortDescending: sortDescending,
      page: 1 // Reset to first page when applying new filters
    };

    dispatch(setFilterParams(newFilterParams));
    dispatch(filterItems(newFilterParams));
  }, [dispatch, filterParams, localFilters]);

  const handleResetFilters = useCallback(() => {
    setLocalFilters({
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      sortOption: 0
    });

    const resetFilterParams = {
      searchQuery: filterParams.searchQuery, // Keep the search query
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'CreatedAt',
      sortDescending: true,
      page: 1,
      pageSize: filterParams.pageSize
    };

    dispatch(setFilterParams(resetFilterParams));
    dispatch(filterItems(resetFilterParams));
  }, [dispatch, filterParams]);

  if (isLoading) {
    return <div className="filter-panel-loading">Loading filters...</div>;
  }

  return (
    <div className="filter-panel">
      <h3>Filter & Sort</h3>
      <div className="filter-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={localFilters.categoryId}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="price-range">Price Range</label>
        <div className="price-inputs">
          <input
            type="number"
            id="min-price"
            placeholder="Min"
            min="0"
            step="0.01"
            value={localFilters.minPrice}
            onChange={handleMinPriceChange}
          />
          <span>to</span>
          <input
            type="number"
            id="max-price"
            placeholder="Max"
            min="0"
            step="0.01"
            value={localFilters.maxPrice}
            onChange={handleMaxPriceChange}
          />
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="sort">Sort By</label>
        <select
          id="sort"
          value={localFilters.sortOption}
          onChange={handleSortChange}
        >
          {sortOptions.map((option, index) => (
            <option key={index} value={index}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button
          onClick={handleApplyFilters}
          className="apply-filters-button"
        >
          Apply Filters
        </button>
        <button
          onClick={handleResetFilters}
          className="reset-filters-button"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default React.memo(FilterPanel);
```

## 7.3. Тестирование производительности

### 7.3.1. Создание тестов для проверки производительности API

```csharp
// DigitalContentPlatform.Tests/Performance/ApiPerformanceTests.cs
using DigitalContentPlatform.API;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace DigitalContentPlatform.Tests.Performance
{
    public class ApiPerformanceTests
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;
        private readonly ITestOutputHelper _output;

        public ApiPerformanceTests(ITestOutputHelper output)
        {
            _output = output;

            var webHostBuilder = new WebHostBuilder()
                .UseContentRoot(System.IO.Directory.GetCurrentDirectory())
                .UseConfiguration(new ConfigurationBuilder()
                    .SetBasePath(System.IO.Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .Build())
                .UseStartup<Startup>();

            _server = new TestServer(webHostBuilder);
            _client = _server.CreateClient();
        }

        [Fact]
        public async Task GetAllItems_Performance()
        {
            // Arrange
            int iterations = 10;
            var stopwatch = new Stopwatch();
            double totalElapsedMs = 0;

            // Act
            for (int i = 0; i < iterations; i++)
            {
                stopwatch.Restart();
                var response = await _client.GetAsync("/api/digitalitems?page=1&pageSize=10");
                response.EnsureSuccessStatusCode();
                stopwatch.Stop();
                
                totalElapsedMs += stopwatch.ElapsedMilliseconds;
                _output.WriteLine($"Request {i + 1}: {stopwatch.ElapsedMilliseconds}ms");
            }

            double averageElapsedMs = totalElapsedMs / iterations;
            _output.WriteLine($"Average response time: {averageElapsedMs}ms");

            // Assert
            Assert.True(averageElapsedMs < 200, $"Average response time ({averageElapsedMs}ms) exceeds threshold (200ms)");
        }

        [Fact]
        public async Task SearchItems_Performance()
        {
            // Arrange
            int iterations = 10;
            var stopwatch = new Stopwatch();
            double totalElapsedMs = 0;
            string searchQuery = "test";

            // Act
            for (int i = 0; i < iterations; i++)
            {
                stopwatch.Restart();
                var response = await _client.GetAsync($"/api/search?query={searchQuery}&page=1&pageSize=10");
                response.EnsureSuccessStatusCode();
                stopwatch.Stop();
                
                totalElapsedMs += stopwatch.ElapsedMilliseconds;
                _output.WriteLine($"Request {i + 1}: {stopwatch.ElapsedMilliseconds}ms");
            }

            double averageElapsedMs = totalElapsedMs / iterations;
            _output.WriteLine($"Average response time: {averageElapsedMs}ms");

            // Assert
            Assert.True(averageElapsedMs < 300, $"Average response time ({averageElapsedMs}ms) exceeds threshold (300ms)");
        }

        [Fact]
        public async Task GetItemById_Performance()
        {
            // Arrange
            int iterations = 10;
            var stopwatch = new Stopwatch();
            double totalElapsedMs = 0;
            string itemId = "11111111-1111-1111-1111-111111111111"; // Тестовый ID

            // Act
            for (int i = 0; i < iterations; i++)
            {
                stopwatch.Restart();
                var response = await _client.GetAsync($"/api/digitalitems/{itemId}");
                stopwatch.Stop();
                
                totalElapsedMs += stopwatch.ElapsedMilliseconds;
                _output.WriteLine($"Request {i + 1}: {stopwatch.ElapsedMilliseconds}ms");
            }

            double averageElapsedMs = totalElapsedMs / iterations;
            _output.WriteLine($"Average response time: {averageElapsedMs}ms");

            // Assert
            Assert.True(averageElapsedMs < 100, $"Average response time ({averageElapsedMs}ms) exceeds threshold (100ms)");
        }
    }
}
```

### 7.3.2. Создание тестов для проверки производительности кэширования

```csharp
// DigitalContentPlatform.Tests/Performance/CachingPerformanceTests.cs
using DigitalContentPlatform.Core.DTOs;
using DigitalContentPlatform.Core.Entities;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Repositories;
using DigitalContentPlatform.Infrastructure.Services;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace DigitalContentPlatform.Tests.Performance
{
    public class CachingPerformanceTests
    {
        private readonly ITestOutputHelper _output;
        private readonly Mock<IDigitalItemRepository> _repositoryMock;
        private readonly IMemoryCache _memoryCache;
        private readonly ICacheService _cacheService;
        private readonly IDigitalItemRepository _cachedRepository;

        public CachingPerformanceTests(ITestOutputHelper output)
        {
            _output = output;
            _repositoryMock = new Mock<IDigitalItemRepository>();
            _memoryCache = new MemoryCache(new MemoryCacheOptions());
            _cacheService = new MemoryCacheService(_memoryCache);
            _cachedRepository = new CachedDigitalItemRepository(_repositoryMock.Object, _cacheService);
        }

        [Fact]
        public async Task GetByIdAsync_WithCaching_ShouldBeFaster()
        {
            // Arrange
            var itemId = Guid.NewGuid();
            var item = new DigitalItem
            {
                Id = itemId,
                Title = "Test Item",
                Description = "Test Description",
                Price = 9.99m,
                Status = "Active"
            };

            _repositoryMock.Setup(r => r.GetByIdAsync(itemId))
                .ReturnsAsync(() => {
                    // Имитируем задержку базы данных
                    Task.Delay(100).Wait();
                    return item;
                });

            var stopwatch = new Stopwatch();
            
            // Act - First call (no cache)
            stopwatch.Start();
            var result1 = await _cachedRepository.GetByIdAsync(itemId);
            stopwatch.Stop();
            var firstCallTime = stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"First call (no cache): {firstCallTime}ms");

            // Act - Second call (with cache)
            stopwatch.Restart();
            var result2 = await _cachedRepository.GetByIdAsync(itemId);
            stopwatch.Stop();
            var secondCallTime = stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"Second call (with cache): {secondCallTime}ms");

            // Assert
            Assert.Equal(item.Id, result1.Id);
            Assert.Equal(item.Id, result2.Id);
            Assert.True(secondCallTime < firstCallTime, $"Cached call ({secondCallTime}ms) should be faster than non-cached call ({firstCallTime}ms)");
            _repositoryMock.Verify(r => r.GetByIdAsync(itemId), Times.Once);
        }

        [Fact]
        public async Task GetAllAsync_WithCaching_ShouldBeFaster()
        {
            // Arrange
            var items = new List<DigitalItem>
            {
                new DigitalItem { Id = Guid.NewGuid(), Title = "Item 1" },
                new DigitalItem { Id = Guid.NewGuid(), Title = "Item 2" }
            };

            var pagedResult = new PagedResult<DigitalItem>
            {
                Items = items,
                TotalItems = 2,
                Page = 1,
                PageSize = 10,
                TotalPages = 1
            };

            _repositoryMock.Setup(r => r.GetAllAsync(1, 10))
                .ReturnsAsync(() => {
                    // Имитируем задержку базы данных
                    Task.Delay(200).Wait();
                    return pagedResult;
                });

            var stopwatch = new Stopwatch();
            
            // Act - First call (no cache)
            stopwatch.Start();
            var result1 = await _cachedRepository.GetAllAsync(1, 10);
            stopwatch.Stop();
            var firstCallTime = stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"First call (no cache): {firstCallTime}ms");

            // Act - Second call (with cache)
            stopwatch.Restart();
            var result2 = await _cachedRepository.GetAllAsync(1, 10);
            stopwatch.Stop();
            var secondCallTime = stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"Second call (with cache): {secondCallTime}ms");

            // Assert
            Assert.Equal(2, result1.Items.Count);
            Assert.Equal(2, result2.Items.Count);
            Assert.True(secondCallTime < firstCallTime, $"Cached call ({secondCallTime}ms) should be faster than non-cached call ({firstCallTime}ms)");
            _repositoryMock.Verify(r => r.GetAllAsync(1, 10), Times.Once);
        }
    }
}
```

### 7.3.3. Создание тестов для проверки производительности клиентской части

```typescript
// src/__tests__/performance/ClientCacheTests.test.ts
import { clientCache } from '../../utils/cacheUtils';

describe('Client Cache Performance Tests', () => {
  beforeEach(() => {
    clientCache.clear();
  });

  test('cache get/set operations should be fast', () => {
    const iterations = 1000;
    const testData = { id: '123', name: 'Test Item', value: 'Some test value' };
    
    // Measure set operations
    const startSet = performance.now();
    for (let i = 0; i < iterations; i++) {
      clientCache.set(`test_key_${i}`, testData, 5);
    }
    const endSet = performance.now();
    const setTime = endSet - startSet;
    
    console.log(`Time to set ${iterations} items: ${setTime}ms (${setTime / iterations}ms per item)`);
    
    // Measure get operations
    const startGet = performance.now();
    for (let i = 0; i < iterations; i++) {
      clientCache.get(`test_key_${i}`);
    }
    const endGet = performance.now();
    const getTime = endGet - startGet;
    
    console.log(`Time to get ${iterations} items: ${getTime}ms (${getTime / iterations}ms per item)`);
    
    // Assert that operations are fast enough
    expect(setTime / iterations).toBeLessThan(0.1); // Less than 0.1ms per set operation
    expect(getTime / iterations).toBeLessThan(0.05); // Less than 0.05ms per get operation
  });

  test('cache should handle large data sets efficiently', () => {
    // Create a large data set
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: `item_${i}`,
      name: `Test Item ${i}`,
      description: `This is a test description for item ${i}. It contains some text to make it larger.`,
      price: Math.random() * 100,
      createdAt: new Date().toISOString(),
      tags: Array.from({ length: 5 }, (_, j) => `tag_${j}`)
    }));
    
    // Measure time to cache large data
    const startSet = performance.now();
    clientCache.set('large_data_key', largeData, 5);
    const endSet = performance.now();
    const setTime = endSet - startSet;
    
    console.log(`Time to cache large data set: ${setTime}ms`);
    
    // Measure time to retrieve large data
    const startGet = performance.now();
    const retrievedData = clientCache.get('large_data_key');
    const endGet = performance.now();
    const getTime = endGet - startGet;
    
    console.log(`Time to retrieve large data set: ${getTime}ms`);
    
    // Assert that operations are fast enough
    expect(setTime).toBeLessThan(10); // Less than 10ms to cache large data
    expect(getTime).toBeLessThan(5); // Less than 5ms to retrieve large data
    expect(retrievedData).toEqual(largeData);
  });

  test('cache should efficiently handle prefix-based operations', () => {
    const prefixCount = 10;
    const itemsPerPrefix = 100;
    
    // Set up cache with prefixed items
    for (let p = 0; p < prefixCount; p++) {
      for (let i = 0; i < itemsPerPrefix; i++) {
        clientCache.set(`prefix_${p}_item_${i}`, { value: `Value ${p}-${i}` }, 5);
      }
    }
    
    // Measure time to clear by prefix
    const startClear = performance.now();
    clientCache.clearByPrefix('prefix_5_');
    const endClear = performance.now();
    const clearTime = endClear - startClear;
    
    console.log(`Time to clear items by prefix: ${clearTime}ms`);
    
    // Assert that operation is fast enough
    expect(clearTime).toBeLessThan(50); // Less than 50ms to clear by prefix
    
    // Verify that only the correct items were cleared
    for (let p = 0; p < prefixCount; p++) {
      for (let i = 0; i < itemsPerPrefix; i++) {
        const key = `prefix_${p}_item_${i}`;
        const value = clientCache.get(key);
        
        if (p === 5) {
          expect(value).toBeNull(); // Items with prefix_5_ should be cleared
        } else {
          expect(value).not.toBeNull(); // Other items should still exist
        }
      }
    }
  });
});
```

### 7.3.4. Создание инструментов для профилирования запросов к базе данных

```csharp
// DigitalContentPlatform.Infrastructure/Services/QueryProfilerService.cs
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class QueryProfilerService
    {
        private readonly ILogger<QueryProfilerService> _logger;
        private readonly ConcurrentDictionary<string, List<long>> _queryTimes = new ConcurrentDictionary<string, List<long>>();
        private readonly int _maxSamples = 100;

        public QueryProfilerService(ILogger<QueryProfilerService> logger)
        {
            _logger = logger;
        }

        public IDisposable Profile(string queryName)
        {
            return new QueryProfiler(this, queryName);
        }

        internal void RecordQueryTime(string queryName, long elapsedMilliseconds)
        {
            _queryTimes.AddOrUpdate(
                queryName,
                _ => new List<long> { elapsedMilliseconds },
                (_, list) =>
                {
                    if (list.Count >= _maxSamples)
                    {
                        list.RemoveAt(0);
                    }
                    list.Add(elapsedMilliseconds);
                    return list;
                });

            _logger.LogDebug($"Query '{queryName}' executed in {elapsedMilliseconds}ms");
        }

        public Dictionary<string, QueryStats> GetQueryStats()
        {
            return _queryTimes.ToDictionary(
                kvp => kvp.Key,
                kvp => new QueryStats
                {
                    AverageTime = kvp.Value.Count > 0 ? kvp.Value.Average() : 0,
                    MinTime = kvp.Value.Count > 0 ? kvp.Value.Min() : 0,
                    MaxTime = kvp.Value.Count > 0 ? kvp.Value.Max() : 0,
                    SampleCount = kvp.Value.Count
                });
        }

        public void ClearStats()
        {
            _queryTimes.Clear();
        }

        private class QueryProfiler : IDisposable
        {
            private readonly QueryProfilerService _service;
            private readonly string _queryName;
            private readonly Stopwatch _stopwatch;

            public QueryProfiler(QueryProfilerService service, string queryName)
            {
                _service = service;
                _queryName = queryName;
                _stopwatch = Stopwatch.StartNew();
            }

            public void Dispose()
            {
                _stopwatch.Stop();
                _service.RecordQueryTime(_queryName, _stopwatch.ElapsedMilliseconds);
            }
        }
    }

    public class QueryStats
    {
        public double AverageTime { get; set; }
        public long MinTime { get; set; }
        public long MaxTime { get; set; }
        public int SampleCount { get; set; }
    }
}
```

Регистрация сервиса профилирования в DI-контейнере:

```csharp
// DigitalContentPlatform.API/Startup.cs (дополнение)
public void ConfigureServices(IServiceCollection services)
{
    // Существующий код...

    // Регистрация сервиса профилирования запросов
    services.AddSingleton<QueryProfilerService>();

    // Существующий код...
}
```

Создание контроллера для получения статистики профилирования:

```csharp
// DigitalContentPlatform.API/Controllers/DiagnosticsController.cs
using DigitalContentPlatform.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalContentPlatform.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticsController : ControllerBase
    {
        private readonly QueryProfilerService _queryProfilerService;

        public DiagnosticsController(QueryProfilerService queryProfilerService)
        {
            _queryProfilerService = queryProfilerService;
        }

        [HttpGet("query-stats")]
        public IActionResult GetQueryStats()
        {
            var stats = _queryProfilerService.GetQueryStats();
            return Ok(stats);
        }

        [HttpPost("clear-stats")]
        public IActionResult ClearStats()
        {
            _queryProfilerService.ClearStats();
            return Ok();
        }
    }
}
```

Использование профилировщика в репозитории:

```csharp
// DigitalContentPlatform.Infrastructure/Repositories/DigitalItemRepository.cs (дополнение)
using DigitalContentPlatform.Infrastructure.Services;

namespace DigitalContentPlatform.Infrastructure.Repositories
{
    public class DigitalItemRepository : IDigitalItemRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly QueryProfilerService _profiler;

        public DigitalItemRepository(
            ApplicationDbContext context,
            QueryProfilerService profiler)
        {
            _context = context;
            _profiler = profiler;
        }

        public async Task<PagedResult<DigitalItem>> GetAllAsync(int page, int pageSize)
        {
            using (_profiler.Profile("DigitalItemRepository.GetAllAsync"))
            {
                // Существующий код...
            }
        }

        public async Task<DigitalItem> GetByIdAsync(Guid id)
        {
            using (_profiler.Profile("DigitalItemRepository.GetByIdAsync"))
            {
                // Существующий код...
            }
        }

        // Аналогично для других методов...
    }
}
```

## 7.4. Оптимизация загрузки изображений

### 7.4.1. Создание сервиса для обработки изображений

```csharp
// DigitalContentPlatform.Core/Interfaces/Services/IImageService.cs
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Core.Interfaces.Services
{
    public interface IImageService
    {
        Task<string> SaveImageAsync(IFormFile image, string folder, int maxWidth = 1200);
        Task<string> CreateThumbnailAsync(IFormFile image, string folder, int width = 300, int height = 300);
        Task<bool> DeleteImageAsync(string imagePath);
    }
}
```

Реализация сервиса для обработки изображений:

```csharp
// DigitalContentPlatform.Infrastructure/Services/ImageService.cs
using DigitalContentPlatform.Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;
using System;
using System.IO;
using System.Threading.Tasks;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class ImageService : IImageService
    {
        private readonly IConfiguration _configuration;
        private readonly string _basePath;

        public ImageService(IConfiguration configuration)
        {
            _configuration = configuration;
            _basePath = _configuration["FileStorage:BasePath"];
        }

        public async Task<string> SaveImageAsync(IFormFile image, string folder, int maxWidth = 1200)
        {
            if (image == null || image.Length == 0)
                throw new ArgumentException("Image is empty or null");

            var extension = Path.GetExtension(image.FileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };

            if (!Array.Exists(allowedExtensions, e => e == extension))
                throw new ArgumentException($"Image extension {extension} is not allowed");

            var fileName = $"{Guid.NewGuid()}{extension}";
            var folderPath = Path.Combine(_basePath, folder);
            var filePath = Path.Combine(folderPath, fileName);

            Directory.CreateDirectory(folderPath);

            using (var stream = new MemoryStream())
            {
                await image.CopyToAsync(stream);
                stream.Position = 0;

                using (var img = Image.Load(stream))
                {
                    // Resize image if it's too large
                    if (img.Width > maxWidth)
                    {
                        img.Mutate(x => x.Resize(new ResizeOptions
                        {
                            Size = new Size(maxWidth, 0),
                            Mode = ResizeMode.Max
                        }));
                    }

                    // Optimize and save
                    await img.SaveAsJpegAsync(filePath, new JpegEncoder
                    {
                        Quality = 85 // Balanced quality
                    });
                }
            }

            return filePath;
        }

        public async Task<string> CreateThumbnailAsync(IFormFile image, string folder, int width = 300, int height = 300)
        {
            if (image == null || image.Length == 0)
                throw new ArgumentException("Image is empty or null");

            var extension = Path.GetExtension(image.FileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };

            if (!Array.Exists(allowedExtensions, e => e == extension))
                throw new ArgumentException($"Image extension {extension} is not allowed");

            var fileName = $"thumb_{Guid.NewGuid()}{extension}";
            var folderPath = Path.Combine(_basePath, folder);
            var filePath = Path.Combine(folderPath, fileName);

            Directory.CreateDirectory(folderPath);

            using (var stream = new MemoryStream())
            {
                await image.CopyToAsync(stream);
                stream.Position = 0;

                using (var img = Image.Load(stream))
                {
                    // Create thumbnail
                    img.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(width, height),
                        Mode = ResizeMode.Crop
                    }));

                    // Optimize and save
                    await img.SaveAsJpegAsync(filePath, new JpegEncoder
                    {
                        Quality = 75 // Lower quality for thumbnails
                    });
                }
            }

            return filePath;
        }

        public Task<bool> DeleteImageAsync(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath) || !File.Exists(imagePath))
                return Task.FromResult(false);

            try
            {
                File.Delete(imagePath);
                return Task.FromResult(true);
            }
            catch (Exception)
            {
                return Task.FromResult(false);
            }
        }
    }
}
```

Установка необходимого пакета:

```bash
dotnet add DigitalContentPlatform.Infrastructure package SixLabors.ImageSharp
```

Регистрация сервиса в DI-контейнере:

```csharp
// DigitalContentPlatform.API/Startup.cs (дополнение)
public void ConfigureServices(IServiceCollection services)
{
    // Существующий код...

    // Регистрация сервиса для обработки изображений
    services.AddScoped<IImageService, ImageService>();

    // Существующий код...
}
```

### 7.4.2. Обновление DigitalItemService для использования оптимизированных изображений

```csharp
// DigitalContentPlatform.Infrastructure/Services/DigitalItemService.cs (обновление)
using DigitalContentPlatform.Core.Interfaces.Services;
// Другие импорты...

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class DigitalItemService : IDigitalItemService
    {
        private readonly IDigitalItemRepository _digitalItemRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IFileService _fileService;
        private readonly IImageService _imageService;
        private readonly IMapper _mapper;

        public DigitalItemService(
            IDigitalItemRepository digitalItemRepository,
            ICategoryRepository categoryRepository,
            IFileService fileService,
            IImageService imageService,
            IMapper mapper)
        {
            _digitalItemRepository = digitalItemRepository;
            _categoryRepository = categoryRepository;
            _fileService = fileService;
            _imageService = imageService;
            _mapper = mapper;
        }

        public async Task<DigitalItemResult> CreateAsync(DigitalItemCreateDto dto, Guid userId)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return new DigitalItemResult { Success = false, Message = "Category not found" };

            // Сохраняем файл контента
            var filePath = await _fileService.SaveFileAsync(dto.File, "items");
            
            // Сохраняем оптимизированную миниатюру
            var thumbnailPath = await _imageService.CreateThumbnailAsync(dto.Thumbnail, "thumbnails");

            var digitalItem = new DigitalItem
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                FileUrl = filePath,
                ThumbnailUrl = thumbnailPath,
                CategoryId = dto.CategoryId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "Active"
            };

            var result = await _digitalItemRepository.CreateAsync(digitalItem);
            if (!result)
                return new DigitalItemResult { Success = false, Message = "Failed to create digital item" };

            return new DigitalItemResult
            {
                Success = true,
                Id = digitalItem.Id,
                Message = "Digital item created successfully"
            };
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
                await _imageService.DeleteImageAsync(item.ThumbnailUrl);
                item.ThumbnailUrl = await _imageService.CreateThumbnailAsync(dto.Thumbnail, "thumbnails");
            }

            var result = await _digitalItemRepository.UpdateAsync(item);
            if (!result)
                return new DigitalItemResult { Success = false, Message = "Failed to update digital item" };

            return new DigitalItemResult
            {
                Success = true,
                Id = item.Id,
                Message = "Digital item updated successfully"
            };
        }

        // Другие методы...
    }
}
```

### 7.4.3. Оптимизация загрузки изображений на клиенте

Создадим компонент для ленивой загрузки изображений:

```tsx
// src/components/common/LazyImage.tsx
import React, { useState, useEffect } from 'react';
import './LazyImage.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  placeholderSrc = '/placeholder.jpg' 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
    };
  }, [src]);

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={`lazy-image ${imageLoaded ? 'loaded' : 'loading'} ${className}`} 
    />
  );
};

export default LazyImage;
```

```css
/* src/components/common/LazyImage.css */
.lazy-image {
  transition: opacity 0.3s ease-in-out;
}

.lazy-image.loading {
  opacity: 0.5;
  filter: blur(5px);
}

.lazy-image.loaded {
  opacity: 1;
  filter: blur(0);
}
```

Обновим компонент DigitalItemCard для использования ленивой загрузки изображений:

```tsx
// src/components/catalog/DigitalItemCard.tsx (обновление)
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DigitalItemDto } from '../../types/digitalItem';
import LazyImage from '../common/LazyImage';
import './DigitalItemCard.css';

interface DigitalItemCardProps {
  item: DigitalItemDto;
  onAddToCart?: (id: string) => void;
}

const DigitalItemCard: React.FC<DigitalItemCardProps> = React.memo(({ item, onAddToCart }) => {
  const navigate = useNavigate();

  const handleViewDetails = useCallback(() => {
    navigate(`/items/${item.id}`);
  }, [navigate, item.id]);

  const handleAddToCart = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(item.id);
    }
  }, [onAddToCart, item.id]);

  return (
    <div className="digital-item-card">
      <LazyImage 
        src={item.thumbnailUrl} 
        alt={item.title} 
        className="item-thumbnail" 
      />
      <div className="item-details">
        <h3>{item.title}</h3>
        <p className="item-description">{item.description.slice(0, 100)}...</p>
        <p className="item-price">${item.price.toFixed(2)}</p>
        <p className="item-creator">By: {item.creatorUsername}</p>
        <div className="item-actions">
          <button onClick={handleViewDetails} className="view-details-button">
            View Details
          </button>
          {onAddToCart && (
            <button onClick={handleAddToCart} className="add-to-cart-button">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default DigitalItemCard;
```

## 7.5. Оптимизация загрузки страниц

### 7.5.1. Внедрение прогрессивной загрузки данных

Создадим хук для прогрессивной загрузки данных:

```typescript
// src/hooks/useProgressiveLoading.ts
import { useState, useEffect, useCallback } from 'react';

interface ProgressiveLoadingOptions<T> {
  initialData?: T;
  loadingDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export function useProgressiveLoading<T>(
  fetchFunction: () => Promise<T>,
  options: ProgressiveLoadingOptions<T> = {}
) {
  const { initialData, loadingDelay = 300, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [error, setError] = useState<any>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Показываем индикатор загрузки только если загрузка занимает больше времени
    const loadingTimer = setTimeout(() => {
      setShowLoadingIndicator(true);
    }, loadingDelay);
    
    try {
      const result = await fetchFunction();
      setData(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
      clearTimeout(loadingTimer);
      setShowLoadingIndicator(false);
    }
  }, [fetchFunction, loadingDelay, onSuccess, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading,
    showLoadingIndicator,
    error,
    reload
  };
}
```

Применим хук в компоненте CatalogPage:

```tsx
// src/pages/CatalogPage.tsx (оптимизация)
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressiveLoading } from '../hooks/useProgressiveLoading';
import { digitalItemApi } from '../api/digitalItemApi';
import DigitalItemCard from '../components/catalog/DigitalItemCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './CatalogPage.css';

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { 
    data: items, 
    isLoading, 
    showLoadingIndicator, 
    error 
  } = useProgressiveLoading(
    () => digitalItemApi.getAll(page, pageSize),
    { loadingDelay: 500 }
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = useCallback((id: string) => {
    // Здесь будет логика добавления в корзину (реализуется на следующем этапе)
    console.log(`Added item ${id} to cart`);
  }, []);

  if (error) return <div className="error">Error: {error.message || 'Failed to load catalog'}</div>;

  return (
    <div className="catalog-page">
      <h1>Digital Content Catalog</h1>
      
      {showLoadingIndicator ? (
        <LoadingSpinner />
      ) : items && items.items.length > 0 ? (
        <>
          <div className="catalog-grid">
            {items.items.map((item) => (
              <DigitalItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
          
          {items.totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1 || isLoading} 
                className="pagination-button"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {items.totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === items.totalPages || isLoading} 
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-catalog">
          <p>No items found in the catalog.</p>
          <button onClick={() => navigate('/create-item')}>Add Your Content</button>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
```

### 7.5.2. Внедрение виртуализации списков для больших наборов данных

Установим библиотеку для виртуализации списков:

```bash
npm install react-window react-virtualized-auto-sizer
```

Создадим компонент для виртуализированного списка:

```tsx
// src/components/common/VirtualizedList.tsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import './VirtualizedList.css';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

function VirtualizedList<T>({ 
  items, 
  itemHeight, 
  renderItem, 
  className = '' 
}: VirtualizedListProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return (
      <div style={style} className="virtualized-item">
        {renderItem(item, index)}
      </div>
    );
  };

  return (
    <div className={`virtualized-list-container ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

export default VirtualizedList;
```

```css
/* src/components/common/VirtualizedList.css */
.virtualized-list-container {
  width: 100%;
  height: 600px; /* Default height, can be overridden */
}

.virtualized-item {
  padding: 10px;
  box-sizing: border-box;
}
```

Применим виртуализацию в компоненте для административной панели:

```tsx
// src/components/admin/ContentManagement.tsx (оптимизация)
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchAdminItems, adminDeleteItem } from '../../store/slices/adminSlice';
import VirtualizedList from '../common/VirtualizedList';
import LoadingSpinner from '../common/LoadingSpinner';
import { DigitalItemDto } from '../../types/digitalItem';
import './ContentManagement.css';

const ContentManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state: RootState) => state.admin);
  const [page, setPage] = useState(1);
  const pageSize = 50; // Увеличиваем размер страницы для виртуализации
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminItems({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  const handleDeleteConfirm = useCallback((itemId: string) => {
    setConfirmDelete(itemId);
  }, []);

  const handleDeleteItem = useCallback((itemId: string) => {
    dispatch(adminDeleteItem(itemId))
      .unwrap()
      .then(() => {
        setConfirmDelete(null);
      })
      .catch((error) => {
        console.error('Failed to delete item:', error);
      });
  }, [dispatch]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  }, []);

  const renderItem = useCallback((item: DigitalItemDto, index: number) => {
    return (
      <div className="content-item" key={item.id}>
        <div className="content-item-thumbnail">
          <img src={item.thumbnailUrl} alt={item.title} />
        </div>
        <div className="content-item-details">
          <h3>{item.title}</h3>
          <p>Creator: {item.creatorUsername}</p>
          <p>Category: {item.categoryName}</p>
          <p>Price: ${item.price.toFixed(2)}</p>
          <p>Status: {item.status}</p>
          <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="content-item-actions">
          <button
            onClick={() => window.open(`/items/${item.id}`, '_blank')}
            className="view-button"
          >
            View
          </button>
          {confirmDelete === item.id ? (
            <div className="confirm-delete">
              <span>Are you sure?</span>
              <button onClick={() => handleDeleteItem(item.id)} className="confirm-yes">
                Yes
              </button>
              <button onClick={() => setConfirmDelete(null)} className="confirm-no">
                No
              </button>
            </div>
          ) : (
            <button onClick={() => handleDeleteConfirm(item.id)} className="delete-button">
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }, [confirmDelete, handleDeleteConfirm, handleDeleteItem]);

  if (loading && !items) return <LoadingSpinner />;
  if (error) return <div className="error">Error: {error}</div>;
  if (!items) return <div className="error">No content data available</div>;

  return (
    <div className="content-management">
      <h1>Content Management</h1>
      
      {items.items.length > 0 ? (
        <>
          <div className="content-list">
            <VirtualizedList
              items={items.items}
              itemHeight={120} // Высота каждого элемента
              renderItem={renderItem}
              className="content-virtualized-list"
            />
          </div>
          
          {items.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {items.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === items.totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-content">
          <p>No content items found.</p>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
```

```css
/* src/components/admin/ContentManagement.css (дополнение) */
.content-virtualized-list {
  height: 700px;
}

.content-item {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  background-color: white;
}

.content-item-thumbnail {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.content-item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-item-details {
  flex: 1;
  padding: 10px;
}

.content-item-details h3 {
  margin-top: 0;
  margin-bottom: 5px;
}

.content-item-details p {
  margin: 3px 0;
  font-size: 0.9em;
  color: #666;
}

.content-item-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  gap: 5px;
}
```

## Заключение

В этом этапе мы успешно оптимизировали и улучшили производительность нашей платформы управления цифровым контентом. Мы внедрили:

1. **Оптимизацию запросов к базе данных**:
   - Добавили индексы для часто используемых полей
   - Внедрили кэширование запросов
   - Оптимизировали запросы с использованием проекций

2. **Оптимизацию клиентской части**:
   - Внедрили ленивую загрузку компонентов
   - Оптимизировали размер бандла
   - Внедрили кэширование на клиенте
   - Оптимизировали рендеринг компонентов

3. **Оптимизацию загрузки изображений**:
   - Создали сервис для обработки и оптимизации изображений
   - Внедрили ленивую загрузку изображений на клиенте

4. **Оптимизацию загрузки страниц**:
   - Внедрили прогрессивную загрузку данных
   - Внедрили виртуализацию списков для больших наборов данных

5. **Инструменты для тестирования производительности**:
   - Создали тесты для проверки производительности API
   - Создали тесты для проверки эффективности кэширования
   - Внедрили профилирование запросов к базе данных

Эти оптимизации значительно улучшили производительность и отзывчивость нашей платформы, обеспечивая лучший пользовательский опыт даже при работе с большими объемами данных.