import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DigitalItemDto, DigitalItemCreateDto, DigitalItemUpdateDto, PagedResult } from '../../types/digitalItem';
import { digitalItemApi } from '../../api/digitalItemApi';

interface DigitalItemState {
  items: PagedResult<DigitalItemDto> | null;
  currentItem: DigitalItemDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: DigitalItemState = {
  items: null,
  currentItem: null,
  loading: false,
  error: null
};

export const fetchAllItems = createAsyncThunk(
  'digitalItem/fetchAll',
  async ({ page, pageSize }: { page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      return await digitalItemApi.getAll(page, pageSize);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch items');
    }
  }
);

export const fetchItemById = createAsyncThunk(
  'digitalItem/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await digitalItemApi.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch item');
    }
  }
);

export const fetchItemsByCategory = createAsyncThunk(
  'digitalItem/fetchByCategory',
  async ({ categoryId, page, pageSize }: { categoryId: string; page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      return await digitalItemApi.getByCategory(categoryId, page, pageSize);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch items by category');
    }
  }
);

export const fetchItemsByUser = createAsyncThunk(
  'digitalItem/fetchByUser',
  async ({ page, pageSize }: { page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      return await digitalItemApi.getByUser(page, pageSize);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user items');
    }
  }
);

export const createItem = createAsyncThunk(
  'digitalItem/create',
  async (data: DigitalItemCreateDto, { rejectWithValue }) => {
    try {
      return await digitalItemApi.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create item');
    }
  }
);

export const updateItem = createAsyncThunk(
  'digitalItem/update',
  async ({ id, data }: { id: string; data: DigitalItemUpdateDto }, { rejectWithValue }) => {
    try {
      return await digitalItemApi.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'digitalItem/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await digitalItemApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete item');
    }
  }
);

const digitalItemSlice = createSlice({
  name: 'digitalItem',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    }
  },
  extraReducers: (builder) => {
    // fetchAllItems
    builder.addCase(fetchAllItems.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllItems.fulfilled, (state, action: PayloadAction<PagedResult<DigitalItemDto>>) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchAllItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchItemById
    builder.addCase(fetchItemById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchItemById.fulfilled, (state, action: PayloadAction<DigitalItemDto>) => {
      state.loading = false;
      state.currentItem = action.payload;
    });
    builder.addCase(fetchItemById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchItemsByCategory
    builder.addCase(fetchItemsByCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchItemsByCategory.fulfilled, (state, action: PayloadAction<PagedResult<DigitalItemDto>>) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchItemsByCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchItemsByUser
    builder.addCase(fetchItemsByUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchItemsByUser.fulfilled, (state, action: PayloadAction<PagedResult<DigitalItemDto>>) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchItemsByUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createItem
    builder.addCase(createItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createItem.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // updateItem
    builder.addCase(updateItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateItem.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // deleteItem
    builder.addCase(deleteItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteItem.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(deleteItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearError, clearCurrentItem } = digitalItemSlice.actions;
export default digitalItemSlice.reducer;
