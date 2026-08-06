import {OrderStatusEnum} from "@/modules/stock/domain/enums/order-status.enum";
import {OrderItemInterface, CreateOrderItemInterface} from "@/modules/stock/domain/order-item.interface";

export interface OrderInterface {
    id?: string;
    tableNumber: string;
    items: OrderItemInterface[];
    status: OrderStatusEnum;
    totalAmount: number;
    notes?: string;
    organizationId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateOrderInterface {
    tableNumber: string;
    items: CreateOrderItemInterface[];
    notes?: string;
}

export interface UpdateOrderInterface {
    tableNumber?: string;
    items?: CreateOrderItemInterface[];
    status?: OrderStatusEnum;
    notes?: string;
}
