import {ProductTypeEnum} from "@/modules/stock/domain/enums/product-type.enum";
import {StockInterface} from "@/modules/stock/domain/stock.interface";

export enum ProductType {
    PHYSICAL = 'PHYSICAL',
    DIGITAL = 'DIGITAL',
}

export interface ProductInterface {
    id?: string;
    name: string;
    description?: string | null;
    sku?: string | null;
    type: ProductTypeEnum;
    isPerishable: boolean;
    baseUnit?: string | null;
    unitsPerPack?: number | null;
    unitsPerCase?: number | null;
    purchasePrice?: number;
    salePrice?: number | null;
    packPrice?: number | null;
    casePrice?: number | null;
    packPurchasePrice?: number | null;
    casePurchasePrice?: number | null;
    stockQuantity?: number;
    isOutOfStock?: boolean;
    categoryName?: string;
    status?: boolean;
    organizationId?: string;
    auditId?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    stock?: StockInterface;
}

export interface CreateProductInterface {
    name: string;
    description?: string;
    sku?: string;
    type: ProductTypeEnum;
    isPerishable?: boolean;
    locationId: string;
    categoryIds?: string[];
    baseUnit?: string;
    unitsPerPack?: number;
    unitsPerCase?: number;
    purchasePrice?: number;
    salePrice?: number;
    packPrice?: number;
    casePrice?: number;
    packPurchasePrice?: number;
    casePurchasePrice?: number;
    digitalData?: {
        downloadUrl?: string;
        fileSize?: number;
        mimeType?: string;
    };
    physicalData?: {
        weight?: number;
        dimensions?: string;
        barcode?: string;
    };
}
