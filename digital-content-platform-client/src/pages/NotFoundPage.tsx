// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
    return (
        <div className="not-found-page">
        <div className="not-found-container">
            <h1>404 - Страница не найдена</h1>
            <p>Страница, которую вы ищете, не существует или была перемещена.</p>
            <Link to="/" className="home-button">Вернуться на главную</Link>
        </div>

        </div>
    );
};

export default NotFoundPage;
