// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-container">
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist or has been moved.</p>
                <Link to="/" className="home-button">Return to Home</Link>
            </div>
        </div>
    );
};

export default NotFoundPage;