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
                    <h1>User Profile</h1>
                    <p>Please log in to view your profile.</p>
                    <Link to="/login" className="login-button">Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>

                <div className="profile-tabs">
                    <button
                        className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Info
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        My Items
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'purchases' ? 'active' : ''}`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        My Purchases
                    </button>
                </div>

                <div className="profile-content">
                    {activeTab === 'profile' && (
                        <div className="profile-info">
                            <div className="info-group">
                                <label>Username:</label>
                                <p>{user.username}</p>
                            </div>
                            <div className="info-group">
                                <label>Email:</label>
                                <p>{user.email}</p>
                            </div>
                            <div className="info-group">
                                <label>Role:</label>
                                <p>{user.role}</p>
                            </div>
                            <div className="profile-actions">
                                <Link to="/cart" className="view-cart-button">View Cart</Link>
                                {user.role === 'Creator' || user.role === 'Admin' ? (
                                    <Link to="/create-item" className="create-item-button">Create New Item</Link>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="profile-items">
                            <div className="items-header">
                                <h2>My Digital Content</h2>
                                <Link to="/create-item" className="create-button">Create New</Link>
                            </div>

                            {loading ? (
                                <div className="loading">Loading your items...</div>
                            ) : error ? (
                                <div className="error">Error: {error}</div>
                            ) : items && items.items.length > 0 ? (
                                <>
                                    <div className="items-grid">
                                        {items.items.map(item => (
                                            <div key={item.id} className="item-card-container">
                                                <DigitalItemCard item={item} onAddToCart={() => {}} />
                                                <div className="item-actions">
                                                    <Link to={`/edit-item/${item.id}`} className="edit-button">Edit</Link>
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
                                </>
                            ) : (
                                <div className="empty-items">
                                    <p>You haven't created any digital content yet.</p>
                                    <Link to="/create-item" className="create-button">Create Your First Item</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'purchases' && (
                        <div className="profile-purchases">
                            <h2>My Purchases</h2>
                            <p className="coming-soon">Purchase history will be available soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;