export enum InvoiceStatusEnum {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatusEnum, string> = {
    [InvoiceStatusEnum.UNPAID]: "Impayée",
    [InvoiceStatusEnum.PAID]: "Payée",
    [InvoiceStatusEnum.OVERDUE]: "En retard",
    [InvoiceStatusEnum.CANCELLED]: "Annulée",
}
