// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import digitalItemReducer from './slices/digitalItemSlice';
import searchReducer from './slices/searchSlice';
import adminReducer from './slices/adminSlice';
import cartReducer from './slices/cartSlice';
import sharedContentReducer from './slices/sharedContentSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        digitalItem: digitalItemReducer,
        search: searchReducer,
        admin: adminReducer,
        cart: cartReducer,
        sharedContent: sharedContentReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;