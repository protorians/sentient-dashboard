export interface PaymentMethodInterface {
    id: string;
    name: string;
    type: string;
    feeAmount: number;
    feeRate: number;
    isActive: boolean;
    organizationId: string;
    createdAt: string;
}
