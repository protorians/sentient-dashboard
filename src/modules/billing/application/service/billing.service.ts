import {FetchService} from "@/core/infrastructure/utilities/fetch.service";

export class BillingService extends FetchService {
    // Payment Methods
    static async addPaymentMethod(payload: any) {
        return await this.post('/billing/payment-methods', payload);
    }

    static async getPaymentMethods() {
        return await this.get('/billing/payment-methods');
    }

    // Orders
    static async createOrder(payload: any) {
        return await this.post('/billing/orders', payload);
    }

    static async getOrders() {
        return await this.get('/billing/orders');
    }

    static async getOrderById(id: string) {
        return await this.get(`/billing/orders/${id}`);
    }

    // Invoices
    static async createInvoice(payload: any) {
        return await this.post('/billing/invoices', payload);
    }

    static async getInvoices() {
        return await this.get('/billing/invoices');
    }

    static async getInvoiceById(id: string) {
        return await this.get(`/billing/invoices/${id}`);
    }

    static async getAnalytics() {
        return await this.get('/billing/analytics');
    }
}
