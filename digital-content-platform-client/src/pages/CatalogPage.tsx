// src/pages/CatalogPage.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {RootState} from '../store';
import { fetchAllItems } from '../store/slices/digitalItemSlice';
import DigitalItemCard from '../components/catalog/DigitalItemCard';
import {useLocation, useNavigate} from 'react-router-dom';
import './CatalogPage.css';
import {addToCart} from "../store/slices/cartSlice";
import {toast} from "react-toastify";


const CatalogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useAppSelector((state: RootState) => state.digitalItem);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);


  useEffect(() => {
    dispatch(fetchAllItems({ page, pageSize }));
  }, [dispatch, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

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

  if (loading) return <div className="loading">Загрузка каталога...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="catalog-page">
      <h1>Каталог цифрового контента</h1>
      { items && items.items.length > 0 ? (
        <div className="catalog-grid">
          {items.items.map((item) => (
            <DigitalItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : (
        <div className="empty-catalog">
          <p>В каталоге нет товаров.</p>
          <button onClick={() => navigate('/create-item')}>Добавить ваш контент</button>
        </div>
      )}

      {items && items.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="pagination-button"
          >
            Назад
          </button>
          <span className="pagination-info">
            Страница {page} из {items.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === items.totalPages}
            className="pagination-button"
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};


export default CatalogPage;
