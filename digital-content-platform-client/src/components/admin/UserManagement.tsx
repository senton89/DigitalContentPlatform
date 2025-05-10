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
            <h1>User Management</h1>
            
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Last Login</th>
                            <th>Actions</th>
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
                                            <option value="User">User</option>
                                            <option value="Creator">Creator</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {user.lastLogin 
                                        ? new Date(user.lastLogin).toLocaleDateString() 
                                        : 'Never'
                                    }
                                </td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <button 
                                            onClick={() => handleRoleUpdate(user.id)}
                                            className="save-button"
                                        >
                                            Save
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleRoleChange(user.id, user.role)}
                                            className="edit-button"
                                        >
                                            Edit Role
                                        </button>
                                    )}
                                    
                                    {confirmDelete === user.id ? (
                                        <div className="confirm-delete">
                                            <span>Are you sure?</span>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="confirm-yes"
                                            >
                                                Yes
                                            </button>
                                            <button 
                                                onClick={() => setConfirmDelete(null)}
                                                className="confirm-no"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleDeleteConfirm(user.id)}
                                            className="delete-button"
                                        >
                                            Delete
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
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {page} of {users.totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(page + 1)} 
                        disabled={page === users.totalPages}
                        className="pagination-button"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserManagement;