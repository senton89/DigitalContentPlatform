// src/components/common/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>Платформа цифрового контента</h3>
                    <p>Ваш универсальный помощник в управлении цифровым контентом</p>
                </div>

                <div className="footer-section">
                    <h3>Быстрые ссылки</h3>
                    <ul>
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/catalog">Каталог</Link></li>
                        <li><Link to="/login">Вход</Link></li>
                        <li><Link to="/register">Регистрация</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Правовая информация</h3>
                    <ul>
                        <li><Link to="/terms">Условия использования</Link></li>
                        <li><Link to="/privacy">Политика конфиденциальности</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} Платформа цифрового контента. Все права защищены.</p>
            </div>
        </footer>
    );
};

export default Footer;
