import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { fetchUsers, updateUserRole, deleteUser } from '../../store/slices/adminSlice';
import './UserManagement.css';

const UserManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { users, loading, error } = useAppSelector((state: RootState) => state.admin);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchUsers({ page, pageSize }));
    }, [dispatch, page, pageSize]);

    const handleRoleChange = (userId: string, currentRole: string) => {
        setEditingUserId(userId);
        setSelectedRole(currentRole);
    };

    const handleRoleUpdate = (userId: string) => {
        if (selectedRole) {
            dispatch(updateUserRole({ id: userId, role: selectedRole }))
                .unwrap()
                .then(() => {
                    setEditingUserId(null);
                })
                .catch((error: unknown) => {
                    console.error('Failed to update role:', error);
                });
        }
    };

    const handleDeleteConfirm = (userId: string) => {
        setConfirmDelete(userId);
    };

    const handleDeleteUser = (userId: string) => {
        dispatch(deleteUser(userId))
            .unwrap()
            .then(() => {
                setConfirmDelete(null);
            })
            .catch((error: unknown) => {
                console.error('Failed to delete user:', error);
            });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (loading && !users) return <div className="loading">Loading users...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!users) return <div className="error">No users data available</div>;

    return (
        <div className="user-management">
            <h1>Управление пользователями</h1>
            
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Имя пользователя</th>
                            <th>Электронная почта</th>
                            <th>Роль</th>
                            <th>Дата создания</th>
                            <th>Последний вход</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.items.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <select 
                                            value={selectedRole} 
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                        >
                                            <option value="User">Пользователь</option>
                                            <option value="Creator">Создатель</option>
                                            <option value="Admin">Администратор</option>
                                        </select>
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {user.lastLogin 
                                        ? new Date(user.lastLogin).toLocaleDateString() 
                                        : 'Никогда'
                                    }
                                </td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <button 
                                            onClick={() => handleRoleUpdate(user.id)}
                                            className="save-button"
                                        >
                                            Сохранить
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleRoleChange(user.id, user.role)}
                                            className="edit-button"
                                        >
                                            Изменить роль
                                        </button>
                                    )}
                                    
                                    {confirmDelete === user.id ? (
                                        <div className="confirm-delete">
                                            <span>Вы уверены?</span>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="confirm-yes"
                                            >
                                                Да
                                            </button>
                                            <button 
                                                onClick={() => setConfirmDelete(null)}
                                                className="confirm-no"
                                            >
                                                Нет
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleDeleteConfirm(user.id)}
                                            className="delete-button"
                                        >
                                            Удалить
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange(page - 1)} 
                        disabled={page === 1}
                        className="pagination-button"
                    >
                        Назад
                    </button>
                    <span className="pagination-info">
                        Страница {page} из {users.totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(page + 1)} 
                        disabled={page === users.totalPages}
                        className="pagination-button"
                    >
                        Вперед
                    </button>
                </div>
            )}
        </div>

    );
};

export default UserManagement;
