import {MovementUnitEnum} from "@/modules/stock/domain/stock-movement.interface";

export interface OrderItemInterface {
    id?: string;
    orderId: string;
    productId: string;
    productName?: string;
    quantity: number;
    unit: MovementUnitEnum;
    baseQuantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CreateOrderItemInterface {
    productId: string;
    quantity: number;
    unit?: MovementUnitEnum;
    unitPrice?: number;
}
