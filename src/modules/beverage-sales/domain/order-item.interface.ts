import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";

export interface OrderItemInterface {
    id: string;
    orderId: string;
    productId: string;
    productName?: string;
    quantity: number;
    unit: MovementUnitEnum;
    baseQuantity: number;
    unitPrice: number;
    totalPrice: number;
    product?: ProductInterface;
}

export interface CreateOrderItemInterface {
    productId: string;
    quantity: number;
    unit?: MovementUnitEnum;
    unitPrice?: number;
}
