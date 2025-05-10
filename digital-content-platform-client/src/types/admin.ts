export interface UserDto {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    lastLogin: string | null;
}

export interface UpdateRoleDto {
    role: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalItems: number;
    totalOrders: number;
    totalRevenue: number;
    userRegistrationsByMonth: ChartData[];
    salesByMonth: ChartData[];
    topCategories: CategoryStats[];
}

export interface ChartData {
    label: string;
    value: number;
}

export interface CategoryStats {
    categoryName: string;
    itemCount: number;
    orderCount: number;
    revenue: number;
}