import {OrderStatusEnum} from "@/modules/pos-management/domain/enums/order-status.enum";
import {PosOrderTypeEnum} from "@/modules/pos-management/domain/enums/sale-type.enum";
import {WarehouseTypeEnum} from "@/modules/pos-management/domain/enums/warehouse-type.enum";
import {OrderItemInterface, CreateOrderItemInterface} from "@/modules/pos-management/domain/order-item.interface";
import {MovementUnitEnum} from "@/modules/stock/domain/stock-movement.interface";

export interface PosOrderBundleInterface {
    id?: string;
    bundleId: string;
    bundleName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface OrderInterface {
    id?: string;
    orderNumber: string;
    orderType: PosOrderTypeEnum;
    status: OrderStatusEnum;
    warehouseId: string;
    warehouseType: WarehouseTypeEnum;
    customerId?: string | null;
    tableId?: string | null;
    items: OrderItemInterface[];
    bundles: PosOrderBundleInterface[];
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    receivedAmount: number;
    changeAmount: number;
    billingOrderId?: string | null;
    organizationId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateOrderCustomerInterface {
    name: string;
    phone?: string;
    email?: string;
}

export interface CreateOrderBundleInterface {
    bundleId: string;
    quantity: number;
}

export interface CreateOrderInterface {
    warehouseType: WarehouseTypeEnum;
    orderType?: PosOrderTypeEnum;
    customerId?: string;
    tableId?: string;
    customer?: CreateOrderCustomerInterface;
    items?: CreateOrderItemInterface[];
    bundles?: CreateOrderBundleInterface[];
    discountAmount?: number;
    receivedAmount?: number;
    locationId?: string;
}

export interface UpdateOrderInterface {
    items?: CreateOrderItemInterface[];
    bundles?: CreateOrderBundleInterface[];
    discountAmount?: number;
    receivedAmount?: number;
    orderType?: PosOrderTypeEnum;
    customerId?: string;
    tableId?: string;
    customer?: CreateOrderCustomerInterface;
}

export interface UpdateOrderStatusInterface {
    status: OrderStatusEnum;
}
