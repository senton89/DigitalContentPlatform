export interface CartItemDto {
    id: string;
    digitalItemId: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl: string;
    addedAt: string;
}

export interface CartDto {
    id: string;
    items: CartItemDto[];
    totalPrice: number;
    itemCount: number;
}

export interface AddToCartDto {
    digitalItemId: string;
}

export interface RemoveFromCartDto {
    cartItemId: string;
}