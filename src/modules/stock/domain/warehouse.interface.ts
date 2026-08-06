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
