export interface PosTableInterface {
    id: string;
    label: string;
    number?: number | null;
    warehouseId: string;
    organizationId: string;
    status?: boolean;
    createdAt?: string;
}

export interface CreatePosTableInterface {
    label: string;
    number?: number;
    warehouseId: string;
}
