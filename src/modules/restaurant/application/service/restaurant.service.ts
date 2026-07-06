import {FetchService} from "@/core/infrastructure/utilities/fetch.service";

export class RestaurantService extends FetchService {
    // Dishes
    static async createDish(payload: any) {
        return await this.post('/restaurant/dishes', payload);
    }

    static async getDishesByOrg(orgId: string) {
        return await this.get(`/restaurant/dishes/${orgId}`);
    }

    static async getDishRatings(dishId: string) {
        return await this.get(`/restaurant/dishes/${dishId}/ratings`);
    }

    // Customers
    static async createCustomer(payload: any) {
        return await this.post('/restaurant/customers', payload);
    }

    // Orders
    static async createOrder(payload: any) {
        return await this.post('/restaurant/orders', payload);
    }

    static async updateOrderStatus(id: string, status: string) {
        return await this.put(`/restaurant/orders/${id}/status`, { status });
    }

    static async getOrdersByOrg(orgId: string) {
        return await this.get(`/restaurant/orders/${orgId}`);
    }

    static async createSelfOrder(orgId: string, payload: any) {
        return await this.post(`/restaurant/self/orders/${orgId}`, payload);
    }

    static async createOnlineOrder(orgId: string, payload: any) {
        return await this.post(`/restaurant/online/orders/${orgId}`, payload);
    }

    static async getSelfOrderByCode(orgId: string, code: string) {
        return await this.get(`/restaurant/self/orders/${orgId}/${code}`);
    }

    static async rateOrder(id: string, rating: any) {
        return await this.post(`/restaurant/orders/${id}/rate`, rating);
    }

    // Sessions
    static async openSession(payload: any) {
        return await this.post('/restaurant/sessions/open', payload);
    }

    static async closeSession(payload: any) {
        return await this.post('/restaurant/sessions/close', payload);
    }

    // Menus
    static async createMenu(payload: any) {
        return await this.post('/restaurant/menus', payload);
    }

    // Reports
    static async getReports(orgId: string) {
        return await this.get(`/restaurant/reports/${orgId}`);
    }

    static async getAnalytics() {
        return await this.get('/restaurant/analytics');
    }
}
