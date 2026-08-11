export enum OrderStatusEnum {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    IN_PROGRESS = 'IN_PROGRESS',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
}

export const ORDER_STATUS_LABELS: Record<OrderStatusEnum, string> = {
    [OrderStatusEnum.PENDING]: "En attente",
    [OrderStatusEnum.CONFIRMED]: "Confirmée",
    [OrderStatusEnum.PREPARING]: "En préparation",
    [OrderStatusEnum.READY]: "Prête",
    [OrderStatusEnum.IN_PROGRESS]: "En cours",
    [OrderStatusEnum.PAID]: "Payée",
    [OrderStatusEnum.CANCELLED]: "Annulée",
}
