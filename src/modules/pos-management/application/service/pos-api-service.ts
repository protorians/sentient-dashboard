import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {FetchResponseInterface} from "@/core/domain/typing/response";
import {OrderInterface, CreateOrderInterface, UpdateOrderInterface, UpdateOrderStatusInterface} from "@/modules/pos-management/domain/order.interface";
import {CustomerInterface} from "@/modules/pos-management/domain/customer.interface";
import {PosTableInterface, CreatePosTableInterface} from "@/modules/pos-management/domain/pos-table.interface";
import {PosBundleInterface, CreatePosBundleInterface, UpdatePosBundleInterface} from "@/modules/pos-management/domain/pos-bundle.interface";
import {ProductInterface} from "@/modules/stock/domain/product.interface";

export class PosApiService extends ApiService {
    static async getOrders(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return await this.get<FetchResponseInterface<OrderInterface[]>>(`/pos/orders${query}`);
    }

    static async createOrder(payload: CreateOrderInterface) {
        return await this.post<FetchResponseInterface<OrderInterface>>('/pos/orders', payload);
    }

    static async getOrder(id: string) {
        return await this.get<FetchResponseInterface<OrderInterface>>(`/pos/orders/${id}`);
    }

    static async updateOrder(id: string, payload: UpdateOrderInterface) {
        return await this.put<FetchResponseInterface<OrderInterface>>(`/pos/orders/${id}`, payload);
    }

    static async updateOrderStatus(id: string, payload: UpdateOrderStatusInterface) {
        return await this.put<FetchResponseInterface<OrderInterface>>(`/pos/orders/${id}/status`, payload);
    }

    static async getPosProducts(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return await this.get<FetchResponseInterface<ProductInterface[]>>(`/pos/products${query}`);
    }

    static async searchCustomers(name: string, limit?: number) {
        const query = `?name=${encodeURIComponent(name)}${limit ? `&limit=${limit}` : ''}`;
        return await this.get<FetchResponseInterface<CustomerInterface[]>>(`/pos/customers/search${query}`);
    }

    static async getPosTables(warehouseId?: string) {
        const query = warehouseId ? `?warehouseId=${encodeURIComponent(warehouseId)}` : '';
        return await this.get<FetchResponseInterface<PosTableInterface[]>>(`/pos/tables${query}`);
    }

    static async getPosTable(id: string) {
        return await this.get<FetchResponseInterface<PosTableInterface>>(`/pos/tables/${id}`);
    }

    static async createPosTable(payload: CreatePosTableInterface) {
        return await this.post<FetchResponseInterface<PosTableInterface>>('/pos/tables', payload);
    }

    static async getPosBundles(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return await this.get<FetchResponseInterface<{ data: PosBundleInterface[]; total: number }>>(`/pos/bundles${query}`);
    }

    static async getPosBundle(id: string) {
        return await this.get<FetchResponseInterface<PosBundleInterface>>(`/pos/bundles/${id}`);
    }

    static async createPosBundle(payload: CreatePosBundleInterface) {
        return await this.post<FetchResponseInterface<PosBundleInterface>>('/pos/bundles', payload);
    }

    static async updatePosBundle(id: string, payload: UpdatePosBundleInterface) {
        return await this.put<FetchResponseInterface<PosBundleInterface>>(`/pos/bundles/${id}`, payload);
    }

    static async deletePosBundle(id: string) {
        return await this.delete<FetchResponseInterface<{ deleted: boolean }>>(`/pos/bundles/${id}`);
    }

    static async getPosAnalytics(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return await this.get<FetchResponseInterface<any>>(`/pos/analytics${query}`);
    }
}
