// src/pages/UnauthorizedPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './UnauthorizedPage.css';

const UnauthorizedPage: React.FC = () => {
    return (
        <div className="unauthorized-page">
            <div className="unauthorized-container">
                <h1>Доступ запрещен</h1>
                <p>Извините, у вас нет прав для доступа к этой странице.</p>
                <p>Пожалуйста, свяжитесь с администратором, если вы считаете, что это ошибка.</p>
                <div className="unauthorized-actions">
                    <Link to="/" className="home-button">Перейти на главную</Link>
                    <Link to="/login" className="login-button">Войти</Link>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
