export interface DigitalItemDto {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  categoryId: string;
  categoryName: string;
  userId: string;
  creatorUsername: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface DigitalItemCreateDto {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  file: File | null;
  thumbnail: File | null;
}

export interface DigitalItemUpdateDto {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  file: File | null;
  thumbnail: File | null;
  status: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  description: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  subCategories: CategoryDto[];
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
