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
            <h1>Управление контентом</h1>

            <div className="items-table-container">
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Цена</th>
                            <th>Дата создания</th>
                            <th>Действия</th>
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
                                            <span>Вы уверены?</span>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
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
                                            onClick={() => handleDeleteConfirm(item.id)}
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

            {items.totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange(page - 1)} 
                        disabled={page === 1}
                        className="pagination-button"
                    >
                        Назад
                    </button>
                    <span className="pagination-info">
                        Страница {page} из {items.totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(page + 1)} 
                        disabled={page === items.totalPages}
                        className="pagination-button"
                    >
                        Вперед
                    </button>
                </div>
            )}
        </div>

    );
};

export default ContentManagement;
