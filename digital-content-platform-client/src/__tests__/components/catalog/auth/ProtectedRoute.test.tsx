import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';

const mockStore = configureStore([]);

describe('ProtectedRoute Component', () => {
  test('redirects to login when not authenticated', () => {
    // Настраиваем store с неаутентифицированным пользователем
    const store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
      },
    });

    // Рендерим компонент с защищенным маршрутом
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Проверяем, что произошел редирект на страницу входа
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('allows access to protected route when authenticated', () => {
    // Настраиваем store с аутентифицированным пользователем
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'test', email: 'test@example.com', role: 'User' },
      },
    });

    // Рендерим компонент с защищенным маршрутом
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Проверяем, что защищенный контент отображается
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  test('redirects to unauthorized when role is insufficient', () => {
    // Настраиваем store с пользователем без нужной роли
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'test', email: 'test@example.com', role: 'User' },
      },
    });

    // Рендерим компонент с защищенным маршрутом, требующим роль Admin
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
            <Route element={<ProtectedRoute requiredRole="Admin" />}>
              <Route path="/admin" element={<div>Admin Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Проверяем, что произошел редирект на страницу "Unauthorized"
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('allows access to role-protected route with correct role', () => {
    // Настраиваем store с пользователем с нужной ролью
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'admin', email: 'admin@example.com', role: 'Admin' },
      },
    });

    // Рендерим компонент с защищенным маршрутом, требующим роль Admin
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
            <Route element={<ProtectedRoute requiredRole="Admin" />}>
              <Route path="/admin" element={<div>Admin Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Проверяем, что защищенный контент отображается
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText('Unauthorized Page')).not.toBeInTheDocument();
  });

  test('redirects to unauthorized when user is not admin', () => {
    // Настраиваем store с пользователем без роли Admin
    const store = mockStore({
        auth: {
            isAuthenticated: true,
            user: {
                username: 'user',
                email: 'user@example.com',
                role: 'User'
            },
        },
    });

    // Рендерим компонент с защищенным маршрутом, требующим роль Admin
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
                    <Route element={<ProtectedRoute requiredRole="Admin" />}>
                        <Route path="/admin" element={<div>Admin Dashboard</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </Provider>
    );

    // Проверяем, что произошел редирект на страницу "Unauthorized"
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
});

test('allows access to admin route for admin user', () => {
    // Настраиваем store с пользователем с ролью Admin
    const store = mockStore({
        auth: {
            isAuthenticated: true,
            user: {
                username: 'admin',
                email: 'admin@example.com',
                role: 'Admin'
            },
        },
    });

    // Рендерим компонент с защищенным маршрутом, требующим роль Admin
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
                    <Route element={<ProtectedRoute requiredRole="Admin" />}>
                        <Route path="/admin" element={<div>Admin Dashboard</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </Provider>
    );

    // Проверяем, что админ получает доступ к админ-панели
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Unauthorized Page')).not.toBeInTheDocument();
});
});