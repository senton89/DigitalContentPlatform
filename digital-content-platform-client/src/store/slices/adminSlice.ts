import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminApi } from '../../api/adminApi';
import { UserDto, DashboardStats, UpdateRoleDto } from '../../types/admin';
import { PagedResult, DigitalItemDto } from '../../types/digitalItem';

interface AdminState {
    users: PagedResult<UserDto> | null;
    currentUser: UserDto | null;
    items: PagedResult<DigitalItemDto> | null;
    dashboardStats: DashboardStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    users: null,
    currentUser: null,
    items: null,
    dashboardStats: null,
    loading: false,
    error: null
};

// Асинхронные действия для управления пользователями
export const fetchUsers = createAsyncThunk(
    'admin/fetchUsers',
    async ({ page, pageSize }: { page: number; pageSize: number }, { rejectWithValue }) => {
        try {
            return await adminApi.getUsers(page, pageSize);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'admin/fetchUserById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await adminApi.getUserById(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'admin/updateUserRole',
    async ({ id, role }: { id: string; role: string }, { rejectWithValue }) => {
        try {
            await adminApi.updateUserRole(id, role);
            return { id, role };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'admin/deleteUser',
    async (id: string, { rejectWithValue }) => {
        try {
            await adminApi.deleteUser(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

// Асинхронные действия для управления контентом
export const fetchAdminItems = createAsyncThunk(
    'admin/fetchItems',
    async ({ page, pageSize }: { page: number; pageSize: number }, { rejectWithValue }) => {
        try {
            return await adminApi.getAllItems(page, pageSize);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch items');
        }
    }
);

export const adminDeleteItem = createAsyncThunk(
    'admin/deleteItem',
    async (id: string, { rejectWithValue }) => {
        try {
            await adminApi.deleteItem(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete item');
        }
    }
);

// Асинхронные действия для аналитики
export const fetchDashboardStats = createAsyncThunk(
    'admin/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            return await adminApi.getDashboardStats();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        }
    },
    extraReducers: (builder) => {
        // fetchUsers
        builder.addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PagedResult<UserDto>>) => {
            state.loading = false;
            state.users = action.payload;
        });
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // fetchUserById
        builder.addCase(fetchUserById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUserById.fulfilled, (state, action: PayloadAction<UserDto>) => {
            state.loading = false;
            state.currentUser = action.payload;
        });
        builder.addCase(fetchUserById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // updateUserRole
        builder.addCase(updateUserRole.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateUserRole.fulfilled, (state, action) => {
            state.loading = false;
            if (state.currentUser && state.currentUser.id === action.payload.id) {
                state.currentUser.role = action.payload.role;
            }
            if (state.users) {
                state.users.items = state.users.items.map(user => 
                    user.id === action.payload.id ? { ...user, role: action.payload.role } : user
                );
            }
        });
        builder.addCase(updateUserRole.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // deleteUser
        builder.addCase(deleteUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.loading = false;
            if (state.users) {
                state.users.items = state.users.items.filter(user => user.id !== action.payload);
                state.users.totalItems--;
            }
        });
        builder.addCase(deleteUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // fetchAdminItems
        builder.addCase(fetchAdminItems.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAdminItems.fulfilled, (state, action: PayloadAction<PagedResult<DigitalItemDto>>) => {
            state.loading = false;
            state.items = action.payload;
        });
        builder.addCase(fetchAdminItems.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // adminDeleteItem
        builder.addCase(adminDeleteItem.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(adminDeleteItem.fulfilled, (state, action) => {
            state.loading = false;
            if (state.items) {
                state.items.items = state.items.items.filter(item => item.id !== action.payload);
                state.items.totalItems--;
            }
        });
        builder.addCase(adminDeleteItem.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // fetchDashboardStats
        builder.addCase(fetchDashboardStats.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
            state.loading = false;
            state.dashboardStats = action.payload;
        });
        builder.addCase(fetchDashboardStats.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
});

export const { clearError, clearCurrentUser } = adminSlice.actions;
export default adminSlice.reducer;