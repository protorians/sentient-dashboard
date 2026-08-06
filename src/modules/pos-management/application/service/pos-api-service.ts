import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {FetchResponseInterface} from "@/core/domain/typing/response";
import {OrderInterface, CreateOrderInterface, UpdateOrderInterface} from "@/modules/pos-management/domain/order.interface";

export class PosApiService extends ApiService {
    // Orders
    static async getOrders() {
        return await this.get<FetchResponseInterface<OrderInterface[]>>('/pos/orders');
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

    static async deleteOrder(id: string) {
        return await this.delete<FetchResponseInterface<{ deleted: boolean }>>(`/pos/orders/${id}`);
    }
}
