import {ProductInterface} from "@/modules/stock/domain/product.interface";

export function getProductStockQuantity(product: ProductInterface): number {
    return product.stock?.quantity ?? 0;
}

export function getLowStockThreshold(product: ProductInterface): number {
    return product.stock?.lowStockThreshold ?? 0;
}

export function isLowStock(product: ProductInterface): boolean {
    const threshold = getLowStockThreshold(product);
    return getProductStockQuantity(product) <= threshold;
}

export function isOutOfStock(product: ProductInterface): boolean {
    return getProductStockQuantity(product) <= 0;
}

export function isProductActive(product: ProductInterface): boolean {
    return product.status !== false;
}

export function getStockStatusLabel(product: ProductInterface): string {
    if (isOutOfStock(product)) return 'Rupture de stock';
    if (isLowStock(product)) return 'Stock faible';
    return 'En stock';
}

export function formatQuantity(value?: number): string {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
}
