import axiosInstance from './axiosConfig';
import { CartDto, AddToCartDto, RemoveFromCartDto } from '../types/cart';

const API_URL = '/cart';

export const cartApi = {
    getCart: async (): Promise<CartDto> => {
        const response = await axiosInstance.get(API_URL);
        response.data.items = response.data.items.$values;
        return response.data;
    },

    addToCart: async (digitalItemId: string): Promise<CartDto> => {
        const response = await axiosInstance.post(`${API_URL}/add`, { digitalItemId });
        return response.data;
    },

    removeFromCart: async (cartItemId: string): Promise<CartDto> => {
        const response = await axiosInstance.post(`${API_URL}/remove`, { cartItemId });
        return response.data;
    },

    clearCart: async (): Promise<void> => {
        await axiosInstance.post(`${API_URL}/clear`);
    }
};