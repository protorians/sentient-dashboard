import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";
import {CartItemLine} from "@/modules/beverage-sales/domain/cart.types";

export function toBaseUnits(product: ProductInterface, quantity: number, unit?: MovementUnitEnum): number {
    const u = unit ?? MovementUnitEnum.UNIT;
    if (u === MovementUnitEnum.UNIT) return quantity;
    const factor = u === MovementUnitEnum.PACK ? product.unitsPerPack : product.unitsPerCase;
    if (!factor || factor <= 0) return quantity;
    return quantity * factor;
}

export function getBaseUnitPrice(product: ProductInterface, unit?: MovementUnitEnum): number {
    const u = unit ?? MovementUnitEnum.UNIT;
    if (u === MovementUnitEnum.UNIT) return product.salePrice ?? 0;
    if (u === MovementUnitEnum.PACK) {
        if (product.packPrice && product.unitsPerPack && product.unitsPerPack > 0) {
            return product.packPrice / product.unitsPerPack;
        }
        return product.salePrice ?? 0;
    }
    if (u === MovementUnitEnum.CASE) {
        if (product.casePrice && product.unitsPerCase && product.unitsPerCase > 0) {
            return product.casePrice / product.unitsPerCase;
        }
        return product.salePrice ?? 0;
    }
    return product.salePrice ?? 0;
}

export function getDisplayPrice(product: ProductInterface, unit?: MovementUnitEnum): number {
    const u = unit ?? MovementUnitEnum.UNIT;
    const salePrice = product.salePrice ?? 0;
    if (u === MovementUnitEnum.UNIT) return salePrice;
    if (u === MovementUnitEnum.PACK) return product.packPrice ?? (salePrice * (product.unitsPerPack && product.unitsPerPack > 0 ? product.unitsPerPack : 1));
    if (u === MovementUnitEnum.CASE) return product.casePrice ?? (salePrice * (product.unitsPerCase && product.unitsPerCase > 0 ? product.unitsPerCase : 1));
    return salePrice;
}

export function formatPrice(amount: number): string {
    return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
}

export function getBundleComputedPrice(items: { quantity: number; product?: ProductInterface }[]): number {
    return items.reduce((sum, item) => sum + ((item.product?.salePrice ?? 0) * item.quantity), 0);
}

export function getBundleUnitPrice(bundle: { price: number; items: { quantity: number; product?: ProductInterface }[] }): number {
    return bundle.price > 0 ? bundle.price : getBundleComputedPrice(bundle.items);
}

export function generateBundleSku(bundles: { sku?: string | null }[] = []): string {
    const max = bundles.reduce((max, bundle) => {
        const match = /^BND-(\d+)$/i.exec(bundle.sku ?? '');
        if (!match) return max;
        return Math.max(max, Number(match[1]));
    }, 0);
    return `BND-${String(max + 1).padStart(3, '0')}`;
}

export function generateTableLabel(tables: { label?: string | null }[] = []): string {
    const max = tables.reduce((max, table) => {
        const match = /^table-(\d+)$/i.exec(table.label ?? '');
        if (!match) return max;
        return Math.max(max, Number(match[1]));
    }, 0);
    return `table-${max + 1}`;
}

export function generateTableNumber(tables: { number?: number | null }[] = []): number | undefined {
    const max = tables.reduce((max, table) => {
        if (!table.number) return max;
        return Math.max(max, table.number);
    }, 0);
    return max > 0 ? max + 1 : undefined;
}

export function filterInStockItems(items: CartItemLine[], products: ProductInterface[] | undefined): CartItemLine[] {
    if (!products || products.length === 0) return items;
    return items.filter(item => {
        const product = products.find(p => p.id === item.productId);
        const stock = product?.stockQuantity ?? product?.stock?.quantity;
        return typeof stock !== 'number' || stock > 0;
    });
}
