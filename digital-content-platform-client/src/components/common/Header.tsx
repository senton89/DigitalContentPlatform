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
                    <Link to="/">Платформа цифрового контента</Link>
                </div>
                
                <div className="search-container desktop-search">
                    <SearchBar />
                </div>
                
                <nav className="nav">
                    <button className="mobile-search-toggle" onClick={toggleMobileSearch}>
                        <i className="fas fa-search"></i>
                    </button>
                    
                    <ul>
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/catalog">Каталог</Link></li>
                        <li><Link to="/shared" style={{marginRight: '-20px'}}>Общий контент</Link></li>
                        {isAuthenticated ? (
                            <>
                                <li><Link to="/upload" style={{marginRight: '-50px'}}>Загрузить контент</Link></li>
                                <li><Link to="/profile" style={{marginLeft: '20px'}}>Профиль</Link></li>
                                {user?.role === 'Admin' && (
                                    <li><Link to="/admin">Админ</Link></li>
                                )}
                                <li>
                                    <button onClick={handleLogout} className="logout-button">
                                        Выйти
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                            <li><Link to="/login">Вход</Link></li>
                                <li><Link to="/register">Регистрация</Link></li>
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
