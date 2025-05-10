// src/components/common/Header.tsx (обновление)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import SearchBar from '../search/SearchBar';
import './Header.css';

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleMobileSearch = () => {
        setShowMobileSearch(!showMobileSearch);
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/">Digital Content Platform</Link>
                </div>
                
                <div className="search-container desktop-search">
                    <SearchBar />
                </div>
                
                <nav className="nav">
                    <button className="mobile-search-toggle" onClick={toggleMobileSearch}>
                        <i className="fas fa-search"></i>
                    </button>
                    
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/catalog">Catalog</Link></li>
                        {isAuthenticated ? (
                            <>
                                <li><Link to="/profile">Profile</Link></li>
                                {user?.role === 'Admin' && (
                                    <li><Link to="/admin">Admin</Link></li>
                                )}
                                <li>
                                    <button onClick={handleLogout} className="logout-button">
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
            
            {showMobileSearch && (
                <div className="mobile-search">
                    <SearchBar onSearch={() => setShowMobileSearch(false)} />
                </div>
            )}
        </header>
    );
};

export default Header;