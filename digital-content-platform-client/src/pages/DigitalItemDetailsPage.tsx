// src/pages/DigitalItemDetailsPage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import { RootState } from '../store';
import { fetchItemById } from '../store/slices/digitalItemSlice';
import './DigitalItemDetailsPage.css';
import {addToCart} from "../store/slices/cartSlice";
import {toast} from "react-toastify";
import SendEmailForm from "../components/shared/SendEmailForm";

const DigitalItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentItem, loading, error } = useAppSelector((state: RootState) => state.digitalItem);

  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchItemById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = (id: string) => {
    if (!isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      navigate('/login', { state: { from: location } });
      return;
    }

    dispatch(addToCart(id))
        .unwrap()
        .then(() => {
          // Показываем уведомление об успешном добавлении
          toast.success('Item added to cart successfully');
        })
        .catch((error) => {
          // Показываем уведомление об ошибке
          toast.error(error || 'Failed to add item to cart');
        });
  };

  const handleBack = () => {
    navigate('/catalog');
  };

  if (loading) return <div className="loading">Загрузка деталей товара...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!currentItem) return <div className="error">Товар не найден</div>;

  return (
      <div className="item-details-page">
        <button onClick={handleBack} className="back-button">← Назад к каталогу</button>
        <div className="item-details-container">
          <div className="item-image">
            <img src={"../" + currentItem.thumbnailUrl} alt={currentItem.title}/>
          </div>
          <div className="item-info">
            <h1>{currentItem.title}</h1>
            <p className="item-category">Категория: {currentItem.categoryName}</p>
            <p className="item-creator">Автор: {currentItem.creatorUsername}</p>
            <p className="item-price">${currentItem.price.toFixed(2)}</p>
            <p className="item-description">{currentItem.description}</p>
            <div className="item-actions">
              <button onClick={() => handleAddToCart(currentItem.id)} className="add-to-cart-button">Добавить в корзину
              </button>
            </div>
            <p className="item-dates">
              Создано: {new Date(currentItem.createdAt).toLocaleDateString()} |
              Обновлено: {new Date(currentItem.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="share-section">
          <h2>Поделиться</h2>
          <SendEmailForm url={currentItem.thumbnailUrl} itemName={currentItem.title}/>
        </div>
      </div>
  );
};


export default DigitalItemDetailsPage;
