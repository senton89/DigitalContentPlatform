// src/pages/CartPage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store';
import { fetchCart, removeFromCart, clearCart } from '../store/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';
import { toast } from 'react-toastify';

const CartPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { cart, loading, error } = useAppSelector((state: RootState) => state.cart);
    const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        } else {
            navigate('/login', { state: { from: '/cart' } });
        }
    }, [dispatch, isAuthenticated, navigate]);

    const handleRemoveItem = (cartItemId: string) => {
        dispatch(removeFromCart(cartItemId))
            .unwrap()
            .then(() => {
                toast.success('Item removed from cart');
            })
            .catch((error) => {
                toast.error(error || 'Failed to remove item from cart');
            });
    };

    const handleClearCart = () => {
        dispatch(clearCart())
            .unwrap()
            .then(() => {
                toast.success('Cart cleared successfully');
            })
            .catch((error) => {
                toast.error(error || 'Failed to clear cart');
            });
    };

    const handleCheckout = () => {
        // Placeholder for checkout functionality
        toast.info('Checkout functionality will be available soon');
    };

    if (loading) return <div className="loading">Загрузка корзины...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;
    if (!cart) return <div className="loading">Загрузка корзины...</div>;

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Ваша корзина</h1>
                    {cart.items.length > 0 && (
                        <button onClick={handleClearCart} className="clear-cart-button">
                            Очистить корзину
                        </button>
                    )}
                </div>

                {cart.items.length === 0 ? (
                    <div className="empty-cart">
                        <p>Ваша корзина пуста.</p>
                        <Link to="/catalog" className="continue-shopping-button">
                            Продолжить покупки
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cart.items.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-image">
                                        <img src={item.thumbnailUrl} alt={item.title} />
                                    </div>
                                    <div className="item-details">
                                        <h3>
                                            <Link to={`/item/${item.digitalItemId}`}>{item.title}</Link>
                                        </h3>
                                        <p className="item-description">{item.description}</p>
                                        <p className="item-added">
                                            Добавлено: {new Date(item.addedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="item-price">₽{item.price.toFixed(2)}</div>
                                    <div className="item-actions">
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="remove-button"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Товаров:</span>
                                <span>{cart.itemCount}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Итого:</span>
                                <span>₽{cart.totalPrice.toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} className="checkout-button">
                                Оформить заказ
                            </button>
                            <Link to="/catalog" className="continue-shopping-link">
                                Продолжить покупки
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


export default CartPage;
