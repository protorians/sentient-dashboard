import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {CreateCustomerInterface, UpdateCustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";

export class CustomerApiService extends ApiService {
    static async create(payload: CreateCustomerInterface) {
        return await this.post('/customers/', payload);
    }

    static async getAll(filters?: Record<string, any>) {
        return await this.get('/customers/', filters);
    }

    static async getById(id: string) {
        return await this.get(`/customers/${id}`);
    }

    static async update(id: string, payload: UpdateCustomerInterface) {
        return await this.put(`/customers/${id}`, payload);
    }

    static async archive(id: string) {
        return await this.delete(`/customers/${id}`);
    }

    static async searchAll(search: string, page: number = 1, limit: number = 20) {
        return await this.get('/customers/search', {search, page, limit});
    }

    static async getCustomerModules(id: string) {
        return await this.get(`/customers/${id}/modules`);
    }

    static async addCustomerModule(id: string, module: string) {
        return await this.post(`/customers/${id}/modules`, {module});
    }

    static async removeCustomerModule(id: string, module: string) {
        return await this.delete(`/customers/${id}/modules/${module}`);
    }
}
