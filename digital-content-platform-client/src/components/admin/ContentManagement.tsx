import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { fetchAdminItems, adminDeleteItem } from '../../store/slices/adminSlice';
import './ContentManagement.css';

const ContentManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items, loading, error } = useAppSelector((state: RootState) => state.admin);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchAdminItems({ page, pageSize }));
    }, [dispatch, page, pageSize]);

    const handleDeleteConfirm = (id: string) => {
        setConfirmDelete(id);
    };

    const handleDelete = (id: string) => {
        dispatch(adminDeleteItem(id))
            .unwrap()
            .then(() => {
                setConfirmDelete(null);
            })
            .catch((error: unknown) => {
                console.error('Failed to delete item:', error);
            });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (loading && !items) return <div className="loading">Loading items...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!items) return <div className="error">No items data available</div>;

    return (
        <div className="content-management">
            <h1>Content Management</h1>

            <div className="items-table-container">
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.title}</td>
                                <td>{item.categoryName}</td>
                                <td>${item.price.toFixed(2)}</td>
                                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {confirmDelete === item.id ? (
                                        <div className="confirm-delete">
                                            <span>Are you sure?</span>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
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
                                            onClick={() => handleDeleteConfirm(item.id)}
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

            {items.totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange(page - 1)} 
                        disabled={page === 1}
                        className="pagination-button"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {page} of {items.totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(page + 1)} 
                        disabled={page === items.totalPages}
                        className="pagination-button"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContentManagement;
