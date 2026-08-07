import {MovementUnitEnum} from "@/modules/stock/domain/stock-movement.interface";

export interface TransferStockInterface {
    productId: string;
    quantity: number;
    unit?: MovementUnitEnum;
    fromLocationId: string;
    toLocationId: string;
    reason?: string;
}
