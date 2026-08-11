import {OrderStatusEnum} from "@/modules/billing/domain/enums/order-status.enum";
import {PaymentMethodInterface} from "@/modules/billing/domain/payment-method.interface";

export interface OrderItemInterface {
    id?: string;
    productId?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status?: boolean;
    deletedAt?: string | null;
}

export interface CreateOrderItemInterface {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderInterface {
    id: string;
    orderNumber: string;
    status: OrderStatusEnum;
    totalAmount: number;
    userId?: string | null;
    customerId?: string | null;
    paymentMethodId?: string | null;
    paymentMethod?: PaymentMethodInterface | null;
    items?: OrderItemInterface[];
    organizationId: string;
    auditId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateOrderInterface {
    items: CreateOrderItemInterface[];
    customerId?: string;
    paymentMethodId?: string;
}
