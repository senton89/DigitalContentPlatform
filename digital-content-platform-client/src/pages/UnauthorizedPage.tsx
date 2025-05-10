// src/pages/UnauthorizedPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './UnauthorizedPage.css';

const UnauthorizedPage: React.FC = () => {
    return (
        <div className="unauthorized-page">
            <div className="unauthorized-container">
                <h1>Unauthorized Access</h1>
                <p>Sorry, you don't have permission to access this page.</p>
                <p>Please contact an administrator if you believe this is an error.</p>
                <div className="unauthorized-actions">
                    <Link to="/" className="home-button">Go to Home</Link>
                    <Link to="/login" className="login-button">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;