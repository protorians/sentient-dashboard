import {ProductTypeEnum} from "@/modules/stock/domain/enums/product-type.enum";
import {StockInterface} from "@/modules/stock/domain/stock.interface";

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
    salePrice?: number | null;
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
    categoryIds?: string[];
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
