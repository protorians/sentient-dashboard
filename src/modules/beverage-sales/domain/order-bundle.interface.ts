export interface OrderBundleInterface {
    id: string;
    orderId: string;
    bundleId: string;
    bundleName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CreateOrderBundleInterface {
    bundleId: string;
    quantity: number;
}
