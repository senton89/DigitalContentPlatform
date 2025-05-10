import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartApi } from '../../api/cartApi';
import { CartDto } from '../../types/cart';

interface CartState {
    cart: CartDto | null;
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    cart: null,
    loading: false,
    error: null
};

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            return await cartApi.getCart();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (digitalItemId: string, { rejectWithValue }) => {
        try {
            return await cartApi.addToCart(digitalItemId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (cartItemId: string, { rejectWithValue }) => {
        try {
            return await cartApi.removeFromCart(cartItemId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            await cartApi.clearCart();
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // fetchCart
        builder.addCase(fetchCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartDto>) => {
            state.loading = false;
            state.cart = action.payload;
        });
        builder.addCase(fetchCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // addToCart
        builder.addCase(addToCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addToCart.fulfilled, (state, action: PayloadAction<CartDto>) => {
            state.loading = false;
            state.cart = action.payload;
        });
        builder.addCase(addToCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // removeFromCart
        builder.addCase(removeFromCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(removeFromCart.fulfilled, (state, action: PayloadAction<CartDto>) => {
            state.loading = false;
            state.cart = action.payload;
        });
        builder.addCase(removeFromCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // clearCart
        builder.addCase(clearCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(clearCart.fulfilled, (state) => {
            state.loading = false;
            state.cart = {
                id: state.cart?.id || '',
                items: [],
                totalPrice: 0,
                itemCount: 0
            };
        });
        builder.addCase(clearCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;