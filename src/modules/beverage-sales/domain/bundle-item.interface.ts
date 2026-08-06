import {ProductInterface} from "@/modules/stock/domain/product.interface";

export interface BundleItemInterface {
    id: string;
    bundleId: string;
    productId: string;
    productName?: string;
    productSku?: string;
    quantity: number;
    product?: ProductInterface;
}

export interface CreateBundleItemInterface {
    productId: string;
    quantity: number;
}
