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
      <img src={item.thumbnailUrl} alt={item.title} className="item-thumbnail" />
      <div className="item-details">
        <h3>{item.title}</h3>
        <p className="item-description">{item.description.slice(0, 100)}...</p>
        <p className="item-price">${item.price.toFixed(2)}</p>
        <p className="item-creator">By: {item.creatorUsername}</p>
        <div className="item-actions">
          <button onClick={handleViewDetails} className="view-details-button">
            Подробнее
          </button>
          {onAddToCart && (
            <button onClick={handleAddToCart} className="add-to-cart-button">
              Добавить в корзину
            </button>
          )}

          <ShareButtons url={shareUrl} title={item.title} />
        </div>
      </div>
    </div>
  );
});

export default DigitalItemCard;
