import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    
    return (
        <div className="admin-layout">
            <div className="admin-sidebar">
                <h2>Панель администратора</h2>
                <nav className="admin-nav">
                    <Link 
                        to="/admin" 
                        className={location.pathname === '/admin' ? 'active' : ''}
                    >
                        Панель
                    </Link>
                    <Link 
                        to="/admin/users" 
                        className={location.pathname === '/admin/users' ? 'active' : ''}
                    >
                        Пользователи
                    </Link>
                    <Link 
                        to="/admin/content" 
                        className={location.pathname === '/admin/content' ? 'active' : ''}
                    >
                        Контент
                    </Link>
                    <Link to="/">Вернуться на сайт</Link>
                </nav>
            </div>

            <div className="admin-content">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
