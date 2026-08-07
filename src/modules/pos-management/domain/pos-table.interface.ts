export interface PosTableInterface {
    id: string;
    label: string;
    number?: number | null;
    warehouseId: string;
    organizationId: string;
    createdAt?: string;
}

export interface CreatePosTableInterface {
    label: string;
    number?: number;
    warehouseId: string;
}
