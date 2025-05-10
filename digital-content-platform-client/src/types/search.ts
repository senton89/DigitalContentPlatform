export interface FilterParams {
    searchQuery?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortDescending?: boolean;
    page: number;
    pageSize: number;
}

export interface SortOption {
    value: string;
    label: string;
}

export const sortOptions: SortOption[] = [
    { value: 'CreatedAt', label: 'Date (Newest First)' },
    { value: 'CreatedAt', label: 'Date (Oldest First)' },
    { value: 'Price', label: 'Price (High to Low)' },
    { value: 'Price', label: 'Price (Low to High)' },
    { value: 'Title', label: 'Title (A-Z)' },
    { value: 'Title', label: 'Title (Z-A)' }
];