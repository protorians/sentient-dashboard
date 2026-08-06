import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {OrderItemInterface, CreateOrderItemInterface} from "@/modules/beverage-sales/domain/order-item.interface";
import {OrderBundleInterface, CreateOrderBundleInterface} from "@/modules/beverage-sales/domain/order-bundle.interface";
import {CreateCustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";

export interface OrderInterface {
    id: string;
    orderNumber: string;
    orderType: OrderTypeEnum;
    status: OrderStatusEnum;
    organizationId: string;
    warehouseId: string;
    warehouseType: WarehouseTypeEnum;
    customerId?: string | null;
    tableId?: string | null;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    billingOrderId?: string | null;
    items: OrderItemInterface[];
    bundles: OrderBundleInterface[];
    createdAt?: string;
}

export interface CreateOrderInterface {
    warehouseType: WarehouseTypeEnum;
    orderType?: OrderTypeEnum;
    customerId?: string;
    tableId?: string;
    customer?: CreateCustomerInterface;
    items?: CreateOrderItemInterface[];
    bundles?: CreateOrderBundleInterface[];
    discountAmount?: number;
    locationId?: string;
}

export interface UpdateOrderStatusInterface {
    status: OrderStatusEnum;
}

export interface UpdateOrderInterface {
    orderType?: OrderTypeEnum;
    customerId?: string;
    tableId?: string;
    customer?: CreateCustomerInterface;
    items?: CreateOrderItemInterface[];
    bundles?: CreateOrderBundleInterface[];
    discountAmount?: number;
}
