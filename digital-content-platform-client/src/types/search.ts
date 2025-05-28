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
    { value: 'CreatedAt', label: 'Дата (сначала новые)' },
    { value: 'CreatedAt', label: 'Дата (сначала старые)' },
    { value: 'Price', label: 'Цена (по убыванию)' },
    { value: 'Price', label: 'Цена (по возрастанию)' },
    { value: 'Title', label: 'Название (А-Я)' },
    { value: 'Title', label: 'Название (Я-А)' }
];
