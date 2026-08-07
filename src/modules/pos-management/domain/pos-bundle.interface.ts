export interface PosBundleItemInterface {
    id?: string;
    productId: string;
    productName?: string;
    productSku?: string | null;
    quantity: number;
}

export interface PosBundleInterface {
    id?: string;
    name: string;
    sku?: string | null;
    description?: string | null;
    type?: string;
    price?: number;
    categoryId?: string | null;
    categoryName?: string | null;
    items: PosBundleItemInterface[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePosBundleInterface {
    name: string;
    sku?: string;
    description?: string;
    type?: string;
    price?: number;
    categoryId?: string;
    items: { productId: string; quantity: number }[];
}

export interface UpdatePosBundleInterface {
    name?: string;
    sku?: string;
    description?: string;
    type?: string;
    price?: number;
    categoryId?: string;
    items?: { productId: string; quantity: number }[];
}
