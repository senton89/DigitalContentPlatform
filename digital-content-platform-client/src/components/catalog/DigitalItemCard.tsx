import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DigitalItemDto } from '../../types/digitalItem';
import './DigitalItemCard.css';
import ShareButtons from '../shared/ShareButtons';

interface DigitalItemCardProps {
  item: DigitalItemDto;
  onAddToCart?: (id: string) => void;
}

const DigitalItemCard: React.FC<DigitalItemCardProps> = React.memo(({ item, onAddToCart }) => {
  const navigate = useNavigate();
  const shareUrl = `${window.location.origin}/items/${item.id}`;

  const handleViewDetails = useCallback(() => {
    navigate(`/items/${item.id}`);
  }, [navigate, item.id]);

  const handleAddToCart = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(item.id);
    }
  }, [onAddToCart, item.id]);

  return (
    <div className="digital-item-card">
      <div className="card-thumbnail-container">
        <img src={item.thumbnailUrl} alt={item.title} className="item-thumbnail" />
      </div>
      <div className="card-body">
        <h3 className="item-title">{item.title}</h3>
        <p className="item-description">{item.description.slice(0, 100)}...</p>
        <p className="item-price">₽{item.price.toFixed(2)}</p>
        <p className="item-author">Автор: {item.creatorUsername}</p>
      </div>
      <div className="card-footer">
        <button onClick={handleViewDetails} className="btn btn-details">
          Подробнее
        </button>
        {onAddToCart && (
          <button onClick={handleAddToCart} className="btn btn-add-to-cart">
            Добавить в корзину
          </button>
        )}
      </div>
      <div className="card-share">
        <ShareButtons url={shareUrl} title={item.title} />
      </div>
    </div>
  );
});

export default DigitalItemCard;