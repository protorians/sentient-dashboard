export interface StockInterface {
    id?: string;
    productId: string;
    quantity: number;
    lowStockThreshold: number;
    locationId?: string | null;
    status?: boolean;
}
