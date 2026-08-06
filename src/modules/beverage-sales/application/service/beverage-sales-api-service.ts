import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {
    FetchResponseInterface,
    FetchResponseWithMetaInterface,
} from "@/core/domain/typing/response";
import {
    CreateOrderInterface,
    OrderInterface,
    UpdateOrderInterface,
    UpdateOrderStatusInterface,
} from "@/modules/beverage-sales/domain/order.interface";
import {
    BundleInterface,
    BundleListResultInterface,
    CreateBundleInterface,
    UpdateBundleInterface,
} from "@/modules/beverage-sales/domain/bundle.interface";
import {PosTableInterface, CreatePosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {CustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";
import {PosAnalyticsInterface} from "@/modules/beverage-sales/domain/pos-analytics.interface";

export class BeverageSalesApiService extends ApiService {
    // Orders
    static async getOrders(filters?: Record<string, any>) {
        return await this.get<FetchResponseInterface<OrderInterface[]>>('/pos/orders', filters);
    }

    static async createOrder(payload: CreateOrderInterface) {
        return await this.post<FetchResponseInterface<OrderInterface>>('/pos/orders', payload);
    }

    static async getOrder(id: string) {
        return await this.get<FetchResponseInterface<OrderInterface>>(`/pos/orders/${id}`);
    }

    static async updateOrderStatus(id: string, payload: UpdateOrderStatusInterface) {
        return await this.put<FetchResponseInterface<OrderInterface>>(`/pos/orders/${id}/status`, payload);
    }

    static async updateOrder(id: string, payload: UpdateOrderInterface) {
        return await this.put<FetchResponseInterface<OrderInterface>>(`/pos/orders/${id}`, payload);
    }

    // Tables
    static async getTables(warehouseId?: string) {
        return await this.get<FetchResponseInterface<PosTableInterface[]>>('/pos/tables', warehouseId ? {warehouseId} : undefined);
    }

    static async getTable(id: string) {
        return await this.get<FetchResponseInterface<PosTableInterface>>(`/pos/tables/${id}`);
    }

    static async createTable(payload: CreatePosTableInterface) {
        return await this.post<FetchResponseInterface<PosTableInterface>>('/pos/tables', payload);
    }

    // Customers
    static async searchCustomers(name: string, limit = 20) {
        return await this.get<FetchResponseInterface<CustomerInterface[]>>('/pos/customers/search', {name, limit});
    }

    // Bundles
    static async getBundles(filters?: Record<string, any>) {
        return await this.get<FetchResponseWithMetaInterface<BundleListResultInterface>>('/pos/bundles', filters);
    }

    static async createBundle(payload: CreateBundleInterface) {
        return await this.post<FetchResponseInterface<BundleInterface>>('/pos/bundles', payload);
    }

    static async getBundle(id: string) {
        return await this.get<FetchResponseInterface<BundleInterface>>(`/pos/bundles/${id}`);
    }

    static async updateBundle(id: string, payload: UpdateBundleInterface) {
        return await this.put<FetchResponseInterface<BundleInterface>>(`/pos/bundles/${id}`, payload);
    }

    static async deleteBundle(id: string) {
        return await this.delete<FetchResponseInterface<{ deleted: boolean }>>(`/pos/bundles/${id}`);
    }

    // Analytics
    static async getAnalytics(params?: Record<string, any>) {
        return await this.get<FetchResponseInterface<PosAnalyticsInterface>>('/pos/analytics', params);
    }
}
