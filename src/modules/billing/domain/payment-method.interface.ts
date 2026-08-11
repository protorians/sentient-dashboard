import {PaymentMethodTypeEnum} from "@/modules/billing/domain/enums/payment-method-type.enum";

export interface PaymentMethodInterface {
    id: string;
    name: string;
    type: PaymentMethodTypeEnum;
    feeAmount: number;
    feeRate: number;
    details?: Record<string, any> | null;
    status: boolean;
    organizationId: string;
    auditId?: string;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

export interface CreatePaymentMethodInterface {
    name: string;
    type: PaymentMethodTypeEnum;
    feeAmount?: number;
    feeRate?: number;
    details?: Record<string, any>;
}

export interface UpdatePaymentMethodInterface {
    name?: string;
    type?: PaymentMethodTypeEnum;
    feeAmount?: number;
    feeRate?: number;
    details?: Record<string, any>;
    status?: boolean;
}
