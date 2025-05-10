// src/__tests__/components/catalog/DigitalItemForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import {MockStore} from 'redux-mock-store';
import thunk from 'redux-thunk';
import DigitalItemForm from '../../../components/catalog/DigitalItemForm';
import { createItem, updateItem } from '../../../store/slices/digitalItemSlice';
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
jest.mock('../../../store/slices/digitalItemSlice', () => ({
  createItem: jest.fn(),
  updateItem: jest.fn(),
  clearError: jest.fn()
}));

describe('DigitalItemForm Component', () => {
  let store: any;
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    store = configureStore({
      reducer: {
        digitalItem: (state = {
          loading: false,
          error: null
        }, action) => state
      }
    });
    jest.clearAllMocks();
  });


  test('renders create form correctly', async () => {
    render(
      <Provider store={store}>
        <DigitalItemForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    // Ждем загрузки категорий
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Create New Digital Item')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Price ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('File')).toBeInTheDocument();
    expect(screen.getByLabelText('Thumbnail')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Item' })).toBeInTheDocument();
  });

  test('renders edit form correctly with initial data', async () => {
    const initialData = {
      title: 'Test Item',
      description: 'Test Description',
      price: 9.99,
      categoryId: 'cat-1',
      file: null,
      thumbnail: null,
      status: 'Active'
    };

    render(
      <Provider store={store}>
        <DigitalItemForm itemId="123" initialData={initialData} onSuccess={mockOnSuccess} />
      </Provider>
    );

    // Ждем загрузки категорий
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Edit Digital Item')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Test Item');
    expect(screen.getByLabelText('Description')).toHaveValue('Test Description');
    expect(screen.getByLabelText('Price ($)')).toHaveValue(9.99);
    expect(screen.getByLabelText('Status')).toHaveValue('Active');
    expect(screen.getByRole('button', { name: 'Update Item' })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <Provider store={store}>
        <DigitalItemForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    // Ждем загрузки категорий
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });

    // Нажимаем кнопку отправки без заполнения полей
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    // Проверяем, что появились сообщения об ошибках
    await waitFor(() => {
      expect(screen.getAllByText('Required').length).toBeGreaterThan(0);
    });
  });

  test('dispatches createItem action with form data', async () => {
    // Мокаем успешный ответ от createItem
    (createItem as unknown as jest.Mock).mockReturnValue({
      type: 'digitalItem/create/fulfilled',
      payload: { id: '123', success: true }
    });

    render(
      <Provider store={store}>
        <DigitalItemForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    // Ждем загрузки категорий
    await screen.findByText('Category 1');

    // Заполняем форму
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Item' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'This is a new test description' } });
    fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '19.99' } });

    // Выбираем категорию
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'cat-1' } });

    // Создаем тестовые файлы
    const file = new File(['test file content'], 'test.pdf', { type: 'application/pdf' });
    const thumbnail = new File(['test thumbnail content'], 'thumbnail.jpg', { type: 'image/jpeg' });

    // Добавляем файлы
    const fileInput = screen.getByLabelText('File');
    const thumbnailInput = screen.getByLabelText('Thumbnail');

    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    Object.defineProperty(thumbnailInput, 'files', {
      value: [thumbnail]
    });

    fireEvent.change(fileInput);
    fireEvent.change(thumbnailInput);

    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    // Проверяем, что был вызван action createItem с правильными данными
    await waitFor(() => {
      expect(createItem).toHaveBeenCalled();
    });

    const callArg = (createItem as unknown as jest.Mock).mock.calls[0][0];
    expect(callArg.title).toBe('New Test Item');
    expect(callArg.description).toBe('This is a new test description');
    expect(callArg.price).toBe(19.99);
    expect(callArg.categoryId).toBe('cat-1');
    expect(callArg.file).toBe(file);
    expect(callArg.thumbnail).toBe(thumbnail);

    // Проверяем, что был вызван onSuccess
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('dispatches updateItem action when editing', async () => {
    // Мокаем успешный ответ от updateItem
    (updateItem as unknown as jest.Mock).mockReturnValue({
      type: 'digitalItem/update/fulfilled',
      payload: { id: '123', success: true }
    });
    
    const initialData = {
      title: 'Test Item',
      description: 'Test Description',
      price: 9.99,
      categoryId: 'cat-1',
      file: null,
      thumbnail: null,
      status: 'Active'
    };
    
    render(
      <Provider store={store}>
        <DigitalItemForm itemId="123" initialData={initialData} onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    // Ждем загрузки категорий
    await screen.findByText('Category 1');
    
    // Изменяем данные формы
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Item' } });
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: 'Update Item' }));
    
    // Проверяем, что был вызван action updateItem с правильными данными
    await waitFor(() => {
      expect(updateItem).toHaveBeenCalled();
    });

    const callArg = (updateItem as unknown as jest.Mock).mock.calls[0][0];
    expect(callArg.id).toBe('123');
    expect(callArg.data.title).toBe('Updated Item');

    // Проверяем, что был вызван onSuccess
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('displays error message when there is an error', async () => {
    // Настраиваем store с ошибкой
    store = configureStore({
      reducer: {
        digitalItem: (state = {
          loading: false,
          error: null
        }, action) => state
      }
    });
    
    render(
      <Provider store={store}>
        <DigitalItemForm onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    // Проверяем, что сообщение об ошибке отображается
    expect(screen.getByText('Failed to create item')).toBeInTheDocument();
  });
});