// src/pages/CreateItemPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DigitalItemForm from '../components/catalog/DigitalItemForm';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import './CreateItemPage.css';

const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/profile');
  };

  return (
    <div className="create-item-page">
      <DigitalItemForm onSuccess={handleSuccess} />
    </div>
  );
};

export default function ProtectedCreateItemPage() {
    return (
        <ProtectedRoute>
            <CreateItemPage />
        </ProtectedRoute>
    );
}
