import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import SearchBar from '../../../components/search/SearchBar';
import { searchItems, setFilterParams } from '../../../store/slices/searchSlice';
import {configureStore} from "@reduxjs/toolkit";

// Мокаем useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Мокаем действия Redux
jest.mock('../../../store/slices/searchSlice', () => ({
    searchItems: jest.fn(),
    setFilterParams: jest.fn(),
}));


describe('SearchBar Component', () => {
    let store: any;
    const mockOnSearch = jest.fn();

    beforeEach(() => {
        store = configureStore({
            reducer: {
                search: (state = {
                    loading: false,
                    error: null
                }, action) => state
            }
        });
        jest.clearAllMocks();
    });

    test('renders search bar correctly', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SearchBar />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByPlaceholderText('Search for digital content...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    test('updates input value when typing', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SearchBar />
                </BrowserRouter>
            </Provider>
        );

        const input = screen.getByPlaceholderText('Search for digital content...');
        fireEvent.change(input, { target: { value: 'test query' } });
        expect(input).toHaveValue('test query');
    });

    test('dispatches search action when form is submitted', () => {
        // Мокаем успешный ответ от searchItems
        (searchItems as unknown as jest.Mock).mockReturnValue({
            type: 'search/searchItems/fulfilled',
            payload: { items: [], totalItems: 0, page: 1, pageSize: 10, totalPages: 0 }
        });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SearchBar onSearch={mockOnSearch} />
                </BrowserRouter>
            </Provider>
        );

        // Вводим поисковый запрос
        const input = screen.getByPlaceholderText('Search for digital content...');
        fireEvent.change(input, { target: { value: 'test query' } });

        // Отправляем форму
        const searchButton = screen.getByRole('button', { name: /search/i });
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        // Проверяем, что были вызваны нужные действия
        expect(setFilterParams).toHaveBeenCalledWith({ searchQuery: 'test query' });
        expect(searchItems).toHaveBeenCalledWith({ query: 'test query', page: 1, pageSize: 10 });
        
        // После успешного поиска должен быть вызван navigate и onSearch
        expect(mockNavigate).toHaveBeenCalledWith('/search');
        expect(mockOnSearch).toHaveBeenCalled();
    });

    test('does not dispatch search action for empty query', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SearchBar />
                </BrowserRouter>
            </Provider>
        );

        // Отправляем форму с пустым запросом
        const searchButton = screen.getByRole('button', { name: /search/i });
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        // Проверяем, что действия не были вызваны
        expect(setFilterParams).not.toHaveBeenCalled();
        expect(searchItems).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('initializes with provided query', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SearchBar initialQuery="initial query" />
                </BrowserRouter>
            </Provider>
        );

        const input = screen.getByPlaceholderText('Search for digital content...');
        expect(input).toHaveValue('initial query');
    });
});
