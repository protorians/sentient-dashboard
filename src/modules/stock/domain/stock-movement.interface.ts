import {StockMovementTypeEnum} from "@/modules/stock/domain/enums/stock-movement-type.enum";

export enum MovementUnitEnum {
    UNIT = 'UNIT',
    PACK = 'PACK',
    CASE = 'CASE',
}

export interface StockMovementInterface {
    id?: string;
    productId: string;
    type: StockMovementTypeEnum;
    quantity: number;
    baseQuantity?: number;
    unit?: MovementUnitEnum;
    locationId?: string | null;
    fromLocationId?: string | null;
    toLocationId?: string | null;
    reason?: string | null;
    createdAt?: string;
}

export interface CreateStockMovementInterface {
    productId: string;
    type: StockMovementTypeEnum;
    quantity: number;
    unit?: MovementUnitEnum;
    locationId: string;
    reason?: string;
}
