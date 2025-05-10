import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import UserManagement from '../../../components/admin/UserManagement';
import { fetchUsers, updateUserRole, deleteUser } from '../../../store/slices/adminSlice';
import {configureStore} from "@reduxjs/toolkit";

// Мокаем действия Redux
jest.mock('../../../store/slices/adminSlice', () => ({
    fetchUsers: jest.fn(),
    updateUserRole: jest.fn(),
    deleteUser: jest.fn(),
}));

describe('UserManagement Component', () => {
    let store: any;

    const mockUsers = {
        items: [
            {
                id: '1',
                username: 'user1',
                email: 'user1@example.com',
                role: 'User',
                createdAt: '2023-01-01T00:00:00Z',
                lastLogin: '2023-01-02T00:00:00Z',
            },
            {
                id: '2',
                username: 'admin1',
                email: 'admin1@example.com',
                role: 'Admin',
                createdAt: '2023-01-01T00:00:00Z',
                lastLogin: null,
            },
        ],
        totalItems: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
    };

    beforeEach(() => {
        store = configureStore({
            reducer: {
                admin: (state = {
                    users: mockUsers,
                    loading: false,
                    error: null
                }, action) => state
            }
        });

        // Мокаем успешные ответы от действий
        (fetchUsers as unknown as jest.Mock).mockReturnValue({
            type: 'admin/fetchUsers/fulfilled',
            payload: mockUsers,
        });

        (updateUserRole as unknown as jest.Mock).mockReturnValue({
            type: 'admin/updateUserRole/fulfilled',
            payload: { id: '1', role: 'Creator' },
        });

        (deleteUser as unknown as jest.Mock).mockReturnValue({
            type: 'admin/deleteUser/fulfilled',
            payload: '1',
        });

        jest.clearAllMocks();
    });

    test('renders user table with correct data', async () => {
        render(
            <Provider store={store}>
                <UserManagement />
            </Provider>
        );

        // Проверяем, что fetchUsers был вызван
        expect(fetchUsers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });

        // Проверяем, что заголовки таблицы отображаются
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Created At')).toBeInTheDocument();
        expect(screen.getByText('Last Login')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        // Проверяем, что данные пользователей отображаются
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('user1@example.com')).toBeInTheDocument();
        expect(screen.getByText('User')).toBeInTheDocument();
        expect(screen.getByText('1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('1/2/2023')).toBeInTheDocument();

        expect(screen.getByText('admin1')).toBeInTheDocument();
        expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Never')).toBeInTheDocument();
    });

    test('allows editing user role', async () => {
        render(
            <Provider store={store}>
                <UserManagement />
            </Provider>
        );

        // Нажимаем кнопку редактирования роли
        const editButtons = screen.getAllByText('Edit Role');
        fireEvent.click(editButtons[0]);

        // Проверяем, что появился выпадающий список
        const selectElement = screen.getByRole('combobox');
        expect(selectElement).toBeInTheDocument();

        // Выбираем новую роль
        fireEvent.change(selectElement, { target: { value: 'Creator' } });
        
        // Нажимаем кнопку сохранения
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        // Проверяем, что был вызван updateUserRole с правильными параметрами
        expect(updateUserRole).toHaveBeenCalledWith({ id: '1', role: 'Creator' });
    });

    test('allows deleting user with confirmation', async () => {
        render(
            <Provider store={store}>
                <UserManagement />
            </Provider>
        );

        // Нажимаем кнопку удаления
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        // Проверяем, что появилось подтверждение
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        
        // Нажимаем кнопку подтверждения
        const confirmButton = screen.getByText('Yes');
        fireEvent.click(confirmButton);

        // Проверяем, что был вызван deleteUser с правильным ID
        expect(deleteUser).toHaveBeenCalledWith('1');
    });

    test('shows loading state', async () => {
        store.getState = jest.fn().mockReturnValue({
            admin: {
                users: null,
                loading: true,
                error: null,
            }
        });

        render(
            <Provider store={store}>
                <UserManagement />
            </Provider>
        );

        expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    test('shows error state', async () => {
        store.getState = jest.fn().mockReturnValue({
            admin: {
                users: null,
                loading: false,
                error: 'Failed to load users',
            }
        });

        render(
            <Provider store={store}>
                <UserManagement />
            </Provider>
        );

        expect(screen.getByText('Error: Failed to load users')).toBeInTheDocument();
    });
});