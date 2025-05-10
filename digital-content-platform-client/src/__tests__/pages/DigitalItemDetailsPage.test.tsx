import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import DigitalItemDetailsPage from '../../pages/DigitalItemDetailsPage';
import { fetchItemById } from '../../store/slices/digitalItemSlice';
import {configureStore} from "@reduxjs/toolkit";

// Мокаем действия Redux
jest.mock('../../store/slices/digitalItemSlice', () => ({
  fetchItemById: jest.fn()
}));

describe('DigitalItemDetailsPage Component', () => {
  let store: any;
  
  const mockItem = {
    id: '123',
    title: 'Test Item',
    description: 'This is a test description.',
    price: 9.99,
    thumbnailUrl: 'test-thumbnail.jpg',
    categoryId: 'cat-1',
    categoryName: 'Test Category',
    userId: 'user-1',
    creatorUsername: 'testuser',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    status: 'Active'
  };
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        digitalItem: (state = {
          currentItem: mockItem,
          loading: false,
          error: null
        }, action) => state
      }
    });
    
    // Мокаем успешный ответ от fetchItemById
    (fetchItemById as unknown as jest.Mock).mockReturnValue({
      type: 'digitalItem/fetchById/fulfilled',
      payload: mockItem
    });
    
    jest.clearAllMocks();
  });
  
  test('renders item details correctly', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/items/123']}>
          <Routes>
            <Route path="/items/:id" element={<DigitalItemDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    // Проверяем, что fetchItemById был вызван с правильным ID
    expect(fetchItemById).toHaveBeenCalledWith('123');
    
    // Проверяем, что детали элемента отображаются
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('Category: Test Category')).toBeInTheDocument();
    expect(screen.getByText('By: testuser')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test-thumbnail.jpg');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Item');
    
    // Проверяем, что даты отображаются
    expect(screen.getByText(/Created: 1\/1\/2023/)).toBeInTheDocument();
    expect(screen.getByText(/Updated: 1\/1\/2023/)).toBeInTheDocument();
  });
  
  test('shows loading state', async () => {
    store = configureStore({
      reducer: {
        digitalItem: (state = {
          currentItem: null,
          loading: true,
          error: null
        }, action) => state
      }
    });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/items/123']}>
          <Routes>
            <Route path="/items/:id" element={<DigitalItemDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    expect(screen.getByText('Loading item details...')).toBeInTheDocument();
  });
  
  test('shows error state', async () => {
    store = configureStore({
      reducer: {
        digitalItem: (state = {
          currentItem: null,
          loading: false,
          error: 'Failed to load item'
        }, action) => state
      }
    });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/items/123']}>
          <Routes>
            <Route path="/items/:id" element={<DigitalItemDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    expect(screen.getByText('Error: Failed to load item')).toBeInTheDocument();
  });
  
  test('shows not found state', async () => {
    store = configureStore({
      reducer: {
        digitalItem: (state = {
          currentItem: null,
          loading: false,
          error: null
        }, action) => state
      }
    });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/items/123']}>
          <Routes>
            <Route path="/items/:id" element={<DigitalItemDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    expect(screen.getByText('Item not found')).toBeInTheDocument();
  });
});