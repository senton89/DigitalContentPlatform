import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchApi } from '../../api/searchApi';
import { FilterParams } from '../../types/search';
import { PagedResult, DigitalItemDto } from '../../types/digitalItem';

interface SearchState {
    searchResults: PagedResult<DigitalItemDto> | null;
    filterParams: FilterParams;
    loading: boolean;
    error: string | null;
}

const initialState: SearchState = {
    searchResults: null,
    filterParams: {
        searchQuery: '',
        categoryId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'CreatedAt',
        sortDescending: true,
        page: 1,
        pageSize: 10
    },
    loading: false,
    error: null
};

export const searchItems = createAsyncThunk(
    'search/searchItems',
    async ({ query, page, pageSize }: { query: string; page: number; pageSize: number }, { rejectWithValue }) => {
        try {
            return await searchApi.search(query, page, pageSize);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to search items');
        }
    }
);

export const filterItems = createAsyncThunk(
    'search/filterItems',
    async (filterParams: FilterParams, { rejectWithValue }) => {
        try {
            return await searchApi.filter(filterParams);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to filter items');
        }
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setFilterParams: (state, action: PayloadAction<Partial<FilterParams>>) => {
            state.filterParams = {
                ...state.filterParams,
                ...action.payload,
                page: action.payload.page !== undefined ? action.payload.page : 1 // Reset to page 1 when filters change
            };
        },
        clearSearch: (state) => {
            state.searchResults = null;
            state.filterParams = initialState.filterParams;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // searchItems
        builder.addCase(searchItems.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(searchItems.fulfilled, (state, action: PayloadAction<PagedResult<DigitalItemDto>>) => {
            state.loading = false;
            state.searchResults = action.payload;
        });
        builder.addCase(searchItems.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // filterItems
        builder.addCase(filterItems.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(filterItems.fulfilled, (state, action: PayloadAction<PagedResult<DigitalItemDto>>) => {
            state.loading = false;
            state.searchResults = action.payload;
        });
        builder.addCase(filterItems.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
});

export const { setFilterParams, clearSearch, clearError } = searchSlice.actions;
export default searchSlice.reducer;