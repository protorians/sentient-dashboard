"use client"

import React, {useState} from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";
import {CartItemLine} from "@/modules/beverage-sales/domain/cart.types";
import {Card} from "@/core/presentation/ui/card";
import {Input} from "@/core/presentation/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {SearchIcon, PlusIcon, MinusIcon, BeerIcon, PackageIcon, BoxesIcon} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {formatPrice, getBaseUnitPrice, getDisplayPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

interface ProductCatalogProps {
    products?: ProductInterface[];
    isLoading?: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    cartItems: CartItemLine[];
    onAdd: (product: ProductInterface, unit: MovementUnitEnum, unitPrice: number) => void;
    onUpdateQty: (productId: string, quantity: number) => void;
}

const UNIT_ICONS: Record<MovementUnitEnum, typeof BeerIcon> = {
    [MovementUnitEnum.UNIT]: BeerIcon,
    [MovementUnitEnum.PACK]: PackageIcon,
    [MovementUnitEnum.CASE]: BoxesIcon,
};

const UNIT_LABELS: Record<MovementUnitEnum, string> = {
    [MovementUnitEnum.UNIT]: 'Unité',
    [MovementUnitEnum.PACK]: 'Pack',
    [MovementUnitEnum.CASE]: 'Casier',
};

export function ProductCatalog({products, isLoading, searchTerm, onSearchChange, cartItems, onAdd, onUpdateQty}: ProductCatalogProps) {
    const [unit, setUnit] = useState<MovementUnitEnum>(MovementUnitEnum.UNIT);

    const filtered = products?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.type ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getQuantity = (productId?: string) => {
        if (!productId) return 0;
        return cartItems
            .filter(item => item.productId === productId && item.unit === unit)
            .reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleIncrement = (product: ProductInterface) => {
        const qty = getQuantity(product.id);
        if (qty === 0) {
            onAdd(product, unit, getBaseUnitPrice(product, unit));
        } else {
            onUpdateQty(product.id!, qty + 1);
        }
    };

    const handleDecrement = (product: ProductInterface) => {
        const qty = getQuantity(product.id);
        if (qty > 0) onUpdateQty(product.id!, qty - 1);
    };

    const UnitIcon = UNIT_ICONS[unit];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-baseline gap-3">
                    <h3 className="text-lg font-bold">Menu</h3>
                    <span className="text-xs text-muted-foreground">{filtered?.length ?? 0} article{(filtered?.length ?? 0) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                        <Input
                            placeholder="Rechercher une boisson..."
                            className="pl-9 h-10 rounded-xl bg-card border-border/40"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Select value={unit} onValueChange={(v) => setUnit(v as MovementUnitEnum)}>
                        <SelectTrigger className="h-10 w-28 rounded-xl bg-card border-border/40">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={MovementUnitEnum.UNIT}>Unité</SelectItem>
                            <SelectItem value={MovementUnitEnum.PACK}>Pack</SelectItem>
                            <SelectItem value={MovementUnitEnum.CASE}>Casier</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <WaitingActivity size={32}/>
                </div>
            ) : filtered?.length === 0 ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
                    Aucune boisson trouvée
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filtered?.map(product => {
                        const qty = getQuantity(product.id);
                        const displayPrice = getDisplayPrice(product, unit);
                        const stock = product.stockQuantity ?? product.stock?.quantity;
                        return (
                            <Card key={product.id} className="flex-row gap-3 p-3 border-border/40 shadow-sm rounded-2xl">
                                <div className="size-24 rounded-xl bg-muted flex items-center justify-center shrink-0 self-center">
                                    <UnitIcon className="size-9 text-muted-foreground/30"/>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                        {product.description || product.categoryName || product.sku || UNIT_LABELS[unit]}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {typeof stock === 'number' ? `${stock} en stock` : '\u00A0'}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-2">
                                        <span className="text-sm font-black">
                                            {displayPrice > 0 ? formatPrice(displayPrice) : '—'}
                                        </span>
                                        <div className="flex items-center gap-2.5">
                                            <button
                                                onClick={() => handleDecrement(product)}
                                                disabled={qty === 0}
                                                className={cn(
                                                    "size-7 rounded-full border flex items-center justify-center transition-colors",
                                                    qty === 0
                                                        ? "border-border/40 text-muted-foreground/30 cursor-not-allowed"
                                                        : "border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                                                )}
                                            >
                                                <MinusIcon className="size-3.5"/>
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                            <button
                                                onClick={() => handleIncrement(product)}
                                                className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                                            >
                                                <PlusIcon className="size-3.5"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
