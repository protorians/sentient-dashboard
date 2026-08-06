import {OrderStatusEnum} from "@/modules/pos-management/domain/enums/order-status.enum";
import {OrderItemInterface, CreateOrderItemInterface} from "@/modules/pos-management/domain/order-item.interface";
import {SaleTypeEnum} from "@/modules/pos-management/domain/enums/sale-type.enum";

export interface OrderInterface {
    id?: string;
    tableNumber?: string;
    customerName?: string;
    saleType: SaleTypeEnum;
    items: OrderItemInterface[];
    status: OrderStatusEnum;
    totalAmount: number;
    notes?: string;
    organizationId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateOrderInterface {
    tableNumber?: string;
    customerName?: string;
    saleType: SaleTypeEnum;
    items: CreateOrderItemInterface[];
    notes?: string;
}

export interface UpdateOrderInterface {
    tableNumber?: string;
    customerName?: string;
    saleType?: SaleTypeEnum;
    items?: CreateOrderItemInterface[];
    status?: OrderStatusEnum;
    notes?: string;
}
