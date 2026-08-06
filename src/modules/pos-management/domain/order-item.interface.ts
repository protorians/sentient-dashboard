import {ProductInterface} from "@/modules/stock/domain/product.interface";

export interface OrderItemInterface {
    id?: string;
    productId: string;
    product?: ProductInterface;
    quantity: number;
    unitPrice: number;
    notes?: string;
}

export interface CreateOrderItemInterface {
    productId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
}
