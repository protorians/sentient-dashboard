import {ApiService} from "@/core/infrastructure/utilities/api-service";

export class CustomerApiService extends ApiService {
    // Customers
    static async create(payload: any) {
        return await this.post('/customers/', payload);
    }

    static async getAll() {
        return await this.get('/customers/');
    }

    static async getById(id: string) {
        return await this.get(`/customers/${id}`);
    }

    static async update(id: string, payload: any) {
        return await this.put(`/customers/${id}`, payload);
    }

    static async deleteCustomer(id: string) {
        return await this.delete(`/customers/${id}`);
    }

    // Modules
    static async getCustomerModules(id: string) {
        return await this.get(`/customers/${id}/modules`);
    }

    static async addCustomerModule(id: string, payload: any) {
        return await this.post(`/customers/${id}/modules`, payload);
    }

    static async removeCustomerModule(id: string, module: string) {
        return await this.delete(`/customers/${id}/modules/${module}`);
    }
}
