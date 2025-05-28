// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
    return (
        <div className="home-page">
        <div className="hero-section">
            <h1>Добро пожаловать на платформу цифрового контента</h1>
            <p>Открывайте, покупайте и управляйте цифровым контентом с легкостью</p>
            <div className="hero-actions">
                <Link to="/catalog" className="browse-button">Просмотреть каталог</Link>
                <Link to="/register" className="register-button">Присоединиться</Link>
            </div>
        </div>

        <div className="features-section">
            <div className="feature">
                <h2>Широкий выбор</h2>
                <p>Доступ к тысячам цифровых товаров в различных категориях</p>
            </div>
            <div className="feature">
                <h2>Безопасные транзакции</h2>
                <p>Покупайте и продавайте с уверенностью, используя нашу безопасную платформу</p>
            </div>
            <div className="feature">
                <h2>Инструменты для создателей</h2>
                <p>Мощные инструменты для создателей контента для управления и продажи своих работ</p>
            </div>
        </div>

        </div>
    );
};

export default HomePage;
