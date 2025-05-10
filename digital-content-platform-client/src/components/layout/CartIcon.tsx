// src/components/layout/CartIcon.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { fetchCart } from '../../store/slices/cartSlice';
import './CartIcon.css';

const CartIcon: React.FC = () => {
    const dispatch = useAppDispatch();
    const { cart } = useAppSelector((state: RootState) => state.cart);
    const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    if (!isAuthenticated) return null;

    return (
        <Link to="/cart" className="cart-icon-container">
            <div className="cart-icon">
                <i className="fas fa-shopping-cart"></i>
                {cart && cart.itemCount > 0 && (
                    <span className="cart-badge">{cart.itemCount}</span>
                )}
            </div>
        </Link>
    );
};

export default CartIcon;