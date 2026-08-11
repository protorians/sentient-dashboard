import {InvoiceStatusEnum} from "@/modules/billing/domain/enums/invoice-status.enum";
import {OrderInterface} from "@/modules/billing/domain/order.interface";
import {PaymentMethodInterface} from "@/modules/billing/domain/payment-method.interface";

export interface InvoiceInterface {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: InvoiceStatusEnum;
    dueDate?: string | null;
    paidAt?: string | null;
    transactionFee?: number;
    orderId: string;
    order?: OrderInterface | null;
    paymentMethodId?: string | null;
    paymentMethod?: PaymentMethodInterface | null;
    accountingEntryId?: string | null;
    paymentEntryId?: string | null;
    organizationId: string;
    auditId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateInvoiceInterface {
    orderId: string;
    dueDate?: string;
}

export interface MarkInvoicePaidInterface {
    paymentMethodId?: string;
}
