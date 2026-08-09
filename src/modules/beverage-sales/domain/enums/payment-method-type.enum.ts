export enum PaymentMethodTypeEnum {
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    MOBILE_MONEY = 'MOBILE_MONEY',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CHECK = 'CHECK',
    E_WALLET = 'E_WALLET',
}

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodTypeEnum, string> = {
    [PaymentMethodTypeEnum.CASH]: "Espèces",
    [PaymentMethodTypeEnum.CREDIT_CARD]: "Carte bancaire",
    [PaymentMethodTypeEnum.DEBIT_CARD]: "Carte de débit",
    [PaymentMethodTypeEnum.MOBILE_MONEY]: "Mobile Money",
    [PaymentMethodTypeEnum.BANK_TRANSFER]: "Virement",
    [PaymentMethodTypeEnum.CHECK]: "Chèque",
    [PaymentMethodTypeEnum.E_WALLET]: "Wallet",
};

export const PAYMENT_METHOD_TYPE_OPTIONS: Array<{ value: PaymentMethodTypeEnum; label: string }> =
    Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(([value, label]) => ({
        value: value as PaymentMethodTypeEnum,
        label,
    }));
