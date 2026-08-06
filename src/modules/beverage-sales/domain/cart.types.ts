import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";

export interface CartItemLine {
    productId: string;
    quantity: number;
    unit: MovementUnitEnum;
    unitPrice: number;
}

export interface CartBundleLine {
    bundleId: string;
    quantity: number;
    unitPrice: number;
}
