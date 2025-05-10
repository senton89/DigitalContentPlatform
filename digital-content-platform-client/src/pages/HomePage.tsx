// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <div className="hero-section">
                <h1>Welcome to Digital Content Platform</h1>
                <p>Discover, buy, and manage digital content with ease</p>
                <div className="hero-actions">
                    <Link to="/catalog" className="browse-button">Browse Catalog</Link>
                    <Link to="/register" className="register-button">Join Now</Link>
                </div>
            </div>

            <div className="features-section">
                <div className="feature">
                    <h2>Wide Selection</h2>
                    <p>Access thousands of digital items across multiple categories</p>
                </div>
                <div className="feature">
                    <h2>Secure Transactions</h2>
                    <p>Buy and sell with confidence using our secure platform</p>
                </div>
                <div className="feature">
                    <h2>Creator Tools</h2>
                    <p>Powerful tools for content creators to manage and sell their work</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;