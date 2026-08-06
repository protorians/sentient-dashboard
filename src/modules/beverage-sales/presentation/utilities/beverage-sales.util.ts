import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";

export function toBaseUnits(product: ProductInterface, quantity: number, unit?: MovementUnitEnum): number {
    const u = unit ?? MovementUnitEnum.UNIT;
    if (u === MovementUnitEnum.UNIT) return quantity;
    const factor = u === MovementUnitEnum.PACK ? product.unitsPerPack : product.unitsPerCase;
    if (!factor || factor <= 0) return quantity;
    return quantity * factor;
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
