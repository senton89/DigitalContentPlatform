import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sharedContentApi } from '../../api/sharedContentApi';
import { CreateSharedContentDto, SharedContentDto } from '../../types/sharedContent';

interface SharedContentState {
    items: SharedContentDto[] | null;
    currentItem: SharedContentDto | null;
    loading: boolean;
    error: string | null;
}

const initialState: SharedContentState = {
    items: null,
    currentItem: null,
    loading: false,
    error: null,
};

// Асинхронные действия
export const fetchAllSharedContent = createAsyncThunk(
    'sharedContent/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await sharedContentApi.getAll();
            console.log(response);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch content');
        }
    }
);

export const uploadSharedContent = createAsyncThunk(
    'sharedContent/upload',
    async (dto: CreateSharedContentDto, { rejectWithValue }) => {
        try {
            return await sharedContentApi.upload(dto);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Upload failed');
        }
    }
);

export const fetchSharedContentById = createAsyncThunk(
    'sharedContent/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await sharedContentApi.getById(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch item');
        }
    }
);

const sharedContentSlice = createSlice({
    name: 'sharedContent',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentItem: (state) => {
            state.currentItem = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllSharedContent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSharedContent.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllSharedContent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(uploadSharedContent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadSharedContent.fulfilled, (state, action) => {
                state.loading = false;
                state.items = [...(state.items || []), action.payload];
            })
            .addCase(uploadSharedContent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchSharedContentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSharedContentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentItem = action.payload;
            })
            .addCase(fetchSharedContentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default sharedContentSlice.reducer;