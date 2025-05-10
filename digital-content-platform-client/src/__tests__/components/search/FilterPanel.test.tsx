import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import FilterPanel from '../../../components/search/FilterPanel';
import { setFilterParams, filterItems } from '../../../store/slices/searchSlice';
import {configureStore} from "@reduxjs/toolkit";

// Мокаем API для категорий
jest.mock('../../../api/digitalItemApi', () => ({
    categoryApi: {
        getAll: jest.fn().mockResolvedValue([
            { id: 'cat-1', name: 'Category 1', description: 'Description 1' },
            { id: 'cat-2', name: 'Category 2', description: 'Description 2' }
        ])
    }
}));

// Мокаем действия Redux
jest.mock('../../../store/slices/searchSlice', () => ({
    setFilterParams: jest.fn(),
    filterItems: jest.fn(),
}));

describe('FilterPanel Component', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                search: (state = {
                    searchQuery: 'test',
                    categoryId: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    sortBy: 'CreatedAt',
                    sortDescending: true,
                    page: 1,
                    pageSize: 10
                }, action) => state
            }
        });
        jest.clearAllMocks();
    });

    test('renders filter panel with categories', async () => {
        render(
            <Provider store={store}>
                <FilterPanel />
            </Provider>
        );

        // Ждем загрузки категорий
        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });

        expect(screen.getByText('Filter & Sort')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Price Range')).toBeInTheDocument();
        expect(screen.getByText('Sort By')).toBeInTheDocument();
        expect(screen.getByText('Apply Filters')).toBeInTheDocument();
        expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    });

    test('applies filters when Apply Filters button is clicked', async () => {
        // Мокаем успешный ответ от filterItems
        (filterItems as unknown as jest.Mock).mockReturnValue({
            type: 'search/filterItems/fulfilled',
            payload: { items: [], totalItems: 0, page: 1, pageSize: 10, totalPages: 0 }
        });

        render(
            <Provider store={store}>
                <FilterPanel />
            </Provider>
        );

        // Ждем загрузки категорий
        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });

        // Выбираем категорию
        const categorySelect = screen.getByLabelText('Category');
        fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

        // Устанавливаем диапазон цен
        const minPriceInput = screen.getByPlaceholderText('Min');
        const maxPriceInput = screen.getByPlaceholderText('Max');
        fireEvent.change(minPriceInput, { target: { value: '10' } });
        fireEvent.change(maxPriceInput, { target: { value: '50' } });

        // Выбираем сортировку
        const sortSelect = screen.getByLabelText('Sort By');
        fireEvent.change(sortSelect, { target: { value: '3' } }); // Price (Low to High)

        // Нажимаем кнопку применения фильтров
        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);

        // Проверяем, что были вызваны нужные действия
        expect(setFilterParams).toHaveBeenCalledWith({
            categoryId: 'cat-1',
            minPrice: 10,
            maxPrice: 50,
            sortBy: 'Price',
            sortDescending: false,
            page: 1,
            searchQuery: 'test',
            pageSize: 10
        });
        expect(filterItems).toHaveBeenCalled();
    });

    test('resets filters when Reset Filters button is clicked', async () => {
        // Мокаем успешный ответ от filterItems
        (filterItems as unknown as jest.Mock).mockReturnValue({
            type: 'search/filterItems/fulfilled',
            payload: { items: [], totalItems: 0, page: 1, pageSize: 10, totalPages: 0 }
        });

        render(
            <Provider store={store}>
                <FilterPanel />
            </Provider>
        );

        // Ждем загрузки категорий
        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });

        // Нажимаем кнопку сброса фильтров
        const resetButton = screen.getByText('Reset Filters');
        fireEvent.click(resetButton);

        // Проверяем, что были вызваны нужные действия
        expect(setFilterParams).toHaveBeenCalledWith({
            searchQuery: 'test', // Сохраняем поисковый запрос
            categoryId: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            sortBy: 'CreatedAt',
            sortDescending: true,
            page: 1,
            pageSize: 10
        });
        expect(filterItems).toHaveBeenCalled();
    });

    test('shows loading state', () => {
        // Переопределяем мок для имитации загрузки
        jest.mock('../../../api/digitalItemApi', () => ({
            categoryApi: {
                getAll: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
            }
        }));

        render(
            <Provider store={store}>
                <FilterPanel />
            </Provider>
        );

        expect(screen.getByText('Loading filters...')).toBeInTheDocument();
    });
});
