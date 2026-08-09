import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";

export interface WarehouseInterface {
    id: string;
    name: string;
    address?: string | null;
    type: WarehouseTypeEnum;
    organizationId: string;
    status: boolean;
    createdAt: string;
}

export interface CreateWarehouseInterface {
    name: string;
    address?: string;
    type: WarehouseTypeEnum;
}

export interface UpdateWarehouseInterface {
    name: string;
    address?: string;
    type: WarehouseTypeEnum;
    status?: boolean;
}
