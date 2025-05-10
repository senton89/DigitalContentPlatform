// src/pages/EditItemPage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { fetchItemById } from '../store/slices/digitalItemSlice';
import DigitalItemForm from '../components/catalog/DigitalItemForm';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import './EditItemPage.css';

const EditItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentItem, loading, error } = useAppSelector((state: RootState) => state.digitalItem);

  useEffect(() => {
    if (id) {
      dispatch(fetchItemById(id));
    }
  }, [dispatch, id]);

  const handleSuccess = () => {
    navigate('/profile');
  };

  if (loading) return <div className="loading">Loading item...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!currentItem) return <div className="error">Item not found</div>;

  const initialData = {
    title: currentItem.title,
    description: currentItem.description,
    price: currentItem.price,
    categoryId: currentItem.categoryId,
    file: null,
    thumbnail: null,
    status: currentItem.status
  };

  return (
    <div className="edit-item-page">
      <h1>Edit Digital Content</h1>
      <DigitalItemForm itemId={id} initialData={initialData} onSuccess={handleSuccess} />
    </div>
  );
};

export default () => (
  <ProtectedRoute>
    <EditItemPage />
  </ProtectedRoute>
);