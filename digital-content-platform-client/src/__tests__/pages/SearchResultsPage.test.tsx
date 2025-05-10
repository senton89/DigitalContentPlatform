import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import SearchResultsPage from '../../pages/SearchResultsPage';
import { filterItems } from '../../store/slices/searchSlice';
import {configureStore} from "@reduxjs/toolkit";

// Мокаем действия Redux
jest.mock('../../store/slices/searchSlice', () => ({
    filterItems: jest.fn(),
}));

describe('SearchResultsPage Component', () => {
    let store: any;

    const mockSearchResults = {
        items: [
            {
                id: '1',
                title: 'Test Item 1',
                description: 'This is test item 1',
                price: 9.99,
                thumbnailUrl: 'test1.jpg',
                categoryId: 'cat-1',
                categoryName: 'Category 1',
                userId: 'user-1',
                creatorUsername: 'testuser',
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                status: 'Active'
            },
            {
                id: '2',
                title: 'Test Item 2',
                description: 'This is test item 2',
                price: 19.99,
                thumbnailUrl: 'test2.jpg',
                categoryId: 'cat-2',
                categoryName: 'Category 2',
                userId: 'user-2',
                creatorUsername: 'testuser2',
                createdAt: '2023-01-02T00:00:00Z',
                updatedAt: '2023-01-02T00:00:00Z',
                status: 'Active'
            }
        ],
        totalItems: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
    };

    const mockFilterParams = {
        searchQuery: 'test',
        categoryId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'CreatedAt',
        sortDescending: true,
        page: 1,
        pageSize: 10
    };

    beforeEach(() => {
        store = configureStore({
            reducer: {
                search: (state = {
                    searchResults: mockSearchResults,
                    filterParams: mockFilterParams,
                    loading: false,
                    error: null
                }, action) => state
            }
        });

        // Мокаем успешный ответ от filterItems
        (filterItems as unknown as jest.Mock).mockReturnValue({
            type: 'search/filterItems/fulfilled',
            payload: mockSearchResults
        });

        jest.clearAllMocks();
    });

    test('renders search results page with items', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/search?query=test']}>
                    <Routes>
                        <Route path="/search" element={<SearchResultsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        // Проверяем, что заголовок страницы отображается
        expect(screen.getByText('Search Results')).toBeInTheDocument();

        // Проверяем, что информация о результатах отображается
        expect(screen.getByText('Found 2 results for "test"')).toBeInTheDocument();

        // Проверяем, что элементы отображаются
        expect(screen.getByText('Test Item 1')).toBeInTheDocument();
        expect(screen.getByText('Test Item 2')).toBeInTheDocument();
        expect(screen.getByText('$9.99')).toBeInTheDocument();
        expect(screen.getByText('$19.99')).toBeInTheDocument();
    });

    test('shows loading state', async () => {
        store = configureStore({
            reducer: {
                search: (state = {
                    searchResults: null,
                    filterParams: mockFilterParams,
                    loading: true,
                    error: null
                }, action) => state
            }
        });

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/search?query=test']}>
                    <Routes>
                        <Route path="/search" element={<SearchResultsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Loading search results...')).toBeInTheDocument();
    });

    test('shows error state', async () => {
        store = configureStore({
            reducer: {
                search: (state = {
                    searchResults: null,
                    filterParams: mockFilterParams,
                    loading: false,
                    error: 'Failed to load search results'
                }, action) => state
            }
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/search?query=test']}>
                    <Routes>
                        <Route path="/search" element={<SearchResultsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Error: Failed to load search results')).toBeInTheDocument();
    });

    test('shows no results message', async () => {
        store = configureStore({
            reducer: {
                search: (state = {
                    searchResults: {
                        items: [],
                        totalItems: 0,
                        page: 1,
                        pageSize: 10,
                        totalPages: 0
                    },
                    filterParams: mockFilterParams,
                    loading: false,
                    error: null
                }, action) => state
            }
        });

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/search?query=test']}>
                    <Routes>
                        <Route path="/search" element={<SearchResultsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('No results found')).toBeInTheDocument();
        expect(screen.getByText('No items match your search for "test".')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filter settings.')).toBeInTheDocument();
    });

    test('dispatches filterItems with URL query parameter', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/search?query=newquery']}>
                    <Routes>
                        <Route path="/search" element={<SearchResultsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        // Проверяем, что filterItems был вызван с правильными параметрами
        await waitFor(() => {
            expect(filterItems).toHaveBeenCalledWith({
                ...mockFilterParams,
                searchQuery: 'newquery',
                page: 1
            });
        });
    });
});
