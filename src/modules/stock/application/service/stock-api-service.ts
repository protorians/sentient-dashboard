import {ApiService} from "@/core/infrastructure/utilities/api-service";

export class StockApiService extends ApiService {
    // Products
    static async createProduct(payload: any) {
        return await this.post('/stock/products', payload);
    }

    static async getProductStock(id: string) {
        return await this.get(`/stock/products/${id}/stock`);
    }

    static async getProductMovements(id: string) {
        return await this.get(`/stock/products/${id}/movements`);
    }

    static async getProductsByOrg(orgId: string) {
        return await this.get(`/stock/organizations/${orgId}/products`);
    }

    // Movements
    static async createMovement(payload: any) {
        return await this.post('/stock/movements', payload);
    }

    static async getAnalytics() {
        return await this.get('/stock/analytics');
    }
}
