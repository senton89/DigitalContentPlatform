import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store';
import { fetchItemsByUser } from '../store/slices/digitalItemSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import DigitalItemCard from '../components/catalog/DigitalItemCard';
import './UserProfilePage.css';
import { logout } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

const UserProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const { items, loading, error } = useAppSelector((state: RootState) => state.digitalItem);
    const [activeTab, setActiveTab] = useState<'profile' | 'items' | 'purchases'>('profile');
    const [page, setPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {
        if (activeTab === 'items') {
            dispatch(fetchItemsByUser({ page, pageSize }));
        }
    }, [dispatch, activeTab, page]);

    const handleLogout = () => {
        dispatch(logout())
            .then(() => {
                navigate('/');
                toast.success('Logged out successfully');
            });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo(0, 0);
    };

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <h1>Профиль пользователя</h1>
                    <p>Пожалуйста, войдите, чтобы просмотреть ваш профиль.</p>
                    <Link to="/login" className="login-button">Войти</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>Мой профиль</h1>
                    <button onClick={handleLogout} className="logout-button">Выйти</button>
                </div>

                <div className="profile-tabs">
                    <button
                        className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Информация профиля
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        Мои товары
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'purchases' ? 'active' : ''}`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        Мои покупки
                    </button>
                </div>

                <div className="profile-content">
                    {activeTab === 'profile' && (
                        <div className="profile-info">
                            <div className="info-group">
                                <label>Имя пользователя:</label>
                                <p>{user.username}</p>
                            </div>
                            <div className="info-group">
                                <label>Электронная почта:</label>
                                <p>{user.email}</p>
                            </div>
                            <div className="info-group">
                                <label>Роль:</label>
                                <p>{user.role}</p>
                            </div>
                            <div className="profile-actions">
                                <Link to="/cart" className="view-cart-button">Просмотр корзины</Link>
                                {user.role === 'Creator' || user.role === 'Admin' ? (
                                    <Link to="/create-item" className="create-item-button">Создать новый товар</Link>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="profile-items">
                            <div className="items-header">
                                <h2>Мой цифровой контент</h2>
                                <Link to="/create-item" className="create-button">Создать новый</Link>
                            </div>

                            {loading ? (
                                <div className="loading">Загрузка ваших товаров...</div>
                            ) : error ? (
                                <div className="error">Ошибка: {error}</div>
                            ) : items && items.items.length > 0 ? (
                                <>
                                    <div className="items-grid">
                                        {items.items.map(item => (
                                            <div key={item.id} className="item-card-container">
                                                <DigitalItemCard item={item} onAddToCart={() => {}} />
                                                <div className="item-actions">
                                                    <Link to={`/edit-item/${item.id}`} className="edit-button">Редактировать</Link>
                                                </div>
                                            </div>
                                        ))}
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
                                </>
                            ) : (
                                <div className="empty-items">
                                    <p>Вы еще не создали цифровой контент.</p>
                                    <Link to="/create-item" className="create-button">Создайте свой первый товар</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'purchases' && (
                        <div className="profile-purchases">
                            <h2>Мои покупки</h2>
                            <p className="coming-soon">История покупок скоро будет доступна.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;