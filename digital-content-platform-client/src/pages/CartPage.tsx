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

    if (loading) return <div className="loading">Loading cart...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!cart) return <div className="loading">Loading cart...</div>;

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Your Shopping Cart</h1>
                    {cart.items.length > 0 && (
                        <button onClick={handleClearCart} className="clear-cart-button">
                            Clear Cart
                        </button>
                    )}
                </div>

                {cart.items.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty.</p>
                        <Link to="/catalog" className="continue-shopping-button">
                            Continue Shopping
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
                                            Added: {new Date(item.addedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="item-price">${item.price.toFixed(2)}</div>
                                    <div className="item-actions">
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="remove-button"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Items:</span>
                                <span>{cart.itemCount}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${cart.totalPrice.toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} className="checkout-button">
                                Proceed to Checkout
                            </button>
                            <Link to="/catalog" className="continue-shopping-link">
                                Continue Shopping
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartPage;