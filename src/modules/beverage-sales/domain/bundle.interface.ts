import {BundleTypeEnum} from "@/modules/beverage-sales/domain/enums/bundle-type.enum";
import {BundleItemInterface, CreateBundleItemInterface} from "@/modules/beverage-sales/domain/bundle-item.interface";

export interface BundleInterface {
    id: string;
    name: string;
    sku?: string | null;
    description?: string | null;
    type: BundleTypeEnum;
    price: number;
    organizationId: string;
    categoryId?: string | null;
    categoryName?: string | null;
    status: boolean;
    items: BundleItemInterface[];
    createdAt?: string;
    updatedAt?: string | null;
}

export interface CreateBundleInterface {
    name: string;
    sku?: string;
    description?: string;
    type?: BundleTypeEnum;
    price?: number;
    categoryId?: string;
    items: CreateBundleItemInterface[];
}

export interface UpdateBundleInterface {
    name?: string;
    sku?: string;
    description?: string;
    type?: BundleTypeEnum;
    price?: number;
    categoryId?: string;
    items?: CreateBundleItemInterface[];
}

export interface BundleListResultInterface {
    data: BundleInterface[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
