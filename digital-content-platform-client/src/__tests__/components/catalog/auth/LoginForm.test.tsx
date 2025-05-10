import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import LoginForm from '../../../../components/auth/LoginForm';
import { login } from '../../../../store/slices/authSlice';
import {configureStore} from "@reduxjs/toolkit";

// Мокаем useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Мокаем действие login
jest.mock('../../../store/slices/authSlice', () => ({
  login: jest.fn(),
  clearError: jest.fn(),
}));

describe('LoginForm Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: (state = {
          loading: false,
          error: null
        }, action) => state
      }
    });
    
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

    // Нажимаем кнопку входа без заполнения полей
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Проверяем, что появились сообщения об ошибках
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

    // Вводим неверный email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    
    // Убираем фокус с поля
    fireEvent.blur(screen.getByLabelText(/email/i));

    // Проверяем, что появилось сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  test('dispatches login action with form data', async () => {
    // Мокаем успешный ответ от login
    (login as unknown as jest.Mock).mockReturnValue({
      type: 'auth/login/fulfilled',
      payload: { token: 'test_token', user: { username: 'test', email: 'test@example.com', role: 'User' } },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

    // Заполняем форму
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Проверяем, что был вызван action login с правильными данными
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        rememberMe: false,
      });
    });
  });

  test('displays error message when login fails', async () => {
    // Настраиваем store с ошибкой
    store = configureStore({
      reducer: {
        admin: (state = {
          loading: false,
          error: 'Invalid email or password',
        }, action) => state
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

    // Проверяем, что сообщение об ошибке отображается
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  test('disables button during loading state', async () => {
    // Настраиваем store с состоянием загрузки
    store = configureStore({
      reducer: {
        auth: (state = {
          loading: true,
          error: null,
        }, action) => state
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

    // Проверяем, что кнопка отключена и текст изменен
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Logging in...');
  });
});