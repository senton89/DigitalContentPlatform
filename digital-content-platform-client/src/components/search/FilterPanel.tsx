import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { setFilterParams, filterItems } from '../../store/slices/searchSlice';
import { categoryApi } from '../../api/digitalItemApi';
import { CategoryDto } from '../../types/digitalItem';
import { sortOptions } from '../../types/search';
import './FilterPanel.css';

const FilterPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filterParams } = useAppSelector((state: RootState) => state.search);
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
        const response = await categoryApi.getAll();
        setCategories(Array.isArray(response) ? response : []);
        console.log(categories);
        console.log(response);
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
    return <div className="filter-panel-loading">Загружаем фильтры...</div>;
  }

  return (
      <div className="filter-panel">
        <h3>Фильтр и сортировка</h3>

        <div className="filter-group">
          <label htmlFor="category">Категория</label>
          <select
              id="category"
              value={localFilters.categoryId}
              onChange={handleCategoryChange}
          >
            <option value="">Все категории</option>
            {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="price-range">Ценовой диапазон</label>
          <div className="price-inputs">
            <input
                type="number"
                id="min-price"
                placeholder="Мин"
                min="0"
                step="0.01"
                value={localFilters.minPrice}
                onChange={handleMinPriceChange}
            />
            <span>до</span>
          </div>
          <div className="price-inputs">
            <input
                type="number"
                id="max-price"
                placeholder="Макс"
                min="0"
                step="0.01"
                value={localFilters.maxPrice}
                onChange={handleMaxPriceChange}
            />
          </div>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Сортировать по</label>
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
            Применить фильтры
          </button>
          <button
              onClick={handleResetFilters}
              className="reset-filters-button"
          >
            Сбросить
          </button>
        </div>
      </div>
  );
};

export default React.memo(FilterPanel);