export interface PaymentMethodInterface {
    id: string;
    name: string;
    type: string;
    feeAmount: number;
    feeRate: number;
    status: boolean;
    organizationId: string;
    createdAt: string;
}
