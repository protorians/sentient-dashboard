import {ApiService} from "@/core/infrastructure/utilities/api-service";
import {FetchResponseInterface} from "@/core/domain/typing/response";
import {
    CreatePaymentMethodInterface,
    PaymentMethodInterface,
    UpdatePaymentMethodInterface,
} from "@/modules/billing/domain/payment-method.interface";
import {CreateOrderInterface, OrderInterface} from "@/modules/billing/domain/order.interface";
import {CreateInvoiceInterface, InvoiceInterface, MarkInvoicePaidInterface} from "@/modules/billing/domain/invoice.interface";
import {BillingAnalyticsInterface} from "@/modules/billing/domain/billing-analytics.interface";

export class BillingApiService extends ApiService {
    static async addPaymentMethod(payload: CreatePaymentMethodInterface) {
        return await this.post<FetchResponseInterface<PaymentMethodInterface>>('/billing/payment-methods', payload);
    }

    static async getPaymentMethods() {
        return await this.get<FetchResponseInterface<any>>('/billing/payment-methods');
    }

    static async getPaymentMethodById(id: string) {
        return await this.get<FetchResponseInterface<PaymentMethodInterface>>(`/billing/payment-methods/${id}`);
    }

    static async updatePaymentMethod(id: string, payload: UpdatePaymentMethodInterface) {
        return await this.put<FetchResponseInterface<PaymentMethodInterface>>(`/billing/payment-methods/${id}`, payload);
    }

    static async deletePaymentMethod(id: string) {
        return await this.delete<FetchResponseInterface<{ deleted: boolean }>>(`/billing/payment-methods/${id}`);
    }

    static async createOrder(payload: CreateOrderInterface) {
        return await this.post<FetchResponseInterface<OrderInterface>>('/billing/orders', payload);
    }

    static async getOrders() {
        return await this.get<FetchResponseInterface<any>>('/billing/orders');
    }

    static async getOrderById(id: string) {
        return await this.get<FetchResponseInterface<OrderInterface>>(`/billing/orders/${id}`);
    }

    static async createInvoice(payload: CreateInvoiceInterface) {
        return await this.post<FetchResponseInterface<InvoiceInterface>>('/billing/invoices', payload);
    }

    static async getInvoices() {
        return await this.get<FetchResponseInterface<any>>('/billing/invoices');
    }

    static async getInvoiceById(id: string) {
        return await this.get<FetchResponseInterface<InvoiceInterface>>(`/billing/invoices/${id}`);
    }

    static async payInvoice(id: string, payload: MarkInvoicePaidInterface) {
        return await this.post<FetchResponseInterface<InvoiceInterface>>(`/billing/invoices/${id}/pay`, payload);
    }

    static async getAnalytics() {
        return await this.get<FetchResponseInterface<BillingAnalyticsInterface>>('/billing/analytics');
    }
}
