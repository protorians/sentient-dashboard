import {StockMovementTypeEnum} from "@/modules/stock/domain/enums/stock-movement-type.enum";

export interface StockMovementInterface {
    id?: string;
    productId: string;
    type: StockMovementTypeEnum;
    quantity: number;
    reason?: string | null;
    createdAt?: string;
}

export interface CreateStockMovementInterface {
    productId: string;
    type: StockMovementTypeEnum;
    quantity: number;
    reason?: string;
}
