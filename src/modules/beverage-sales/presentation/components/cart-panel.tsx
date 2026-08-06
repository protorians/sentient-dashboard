"use client"

import React from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {CustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";
import {CartItemLine, CartBundleLine} from "@/modules/beverage-sales/domain/cart.types";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {Badge} from "@/core/presentation/ui/badge";
import {Separator} from "@/core/presentation/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {
    PlusIcon,
    MinusIcon,
    TrashIcon,
    ShoppingCartIcon,
    UserIcon,
    UtensilsIcon,
    WineIcon,
    GiftIcon,
    CheckIcon,
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {formatPrice, toBaseUnits} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

interface CartPanelProps {
    products?: ProductInterface[];
    bundles?: BundleInterface[];
    items: CartItemLine[];
    bundleLines: CartBundleLine[];
    customer?: CustomerInterface | null;
    customerName: string;
    table?: PosTableInterface | null;
    saleType: OrderTypeEnum;
    onUpdateItemQty: (productId: string, quantity: number) => void;
    onUpdateItemUnit: (productId: string, unit: MovementUnitEnum) => void;
    onRemoveItem: (productId: string) => void;
    onUpdateBundleQty: (bundleId: string, quantity: number) => void;
    onRemoveBundle: (bundleId: string) => void;
    onClearCart: () => void;
    onCheckout: () => void;
    isSubmitting?: boolean;
}

export function CartPanel({
    products,
    bundles,
    items,
    bundleLines,
    customer,
    customerName,
    table,
    saleType,
    onUpdateItemQty,
    onUpdateItemUnit,
    onRemoveItem,
    onUpdateBundleQty,
    onRemoveBundle,
    onClearCart,
    onCheckout,
    isSubmitting,
}: CartPanelProps) {
    const itemTotal = items.reduce((sum, item) => {
        const product = products?.find(p => p.id === item.productId);
        return sum + (product ? toBaseUnits(product, item.quantity, item.unit) * item.unitPrice : 0);
    }, 0);

    const bundleTotal = bundleLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);

    const total = itemTotal + bundleTotal;
    const hasSelection = customer !== null || customerName !== '' || table !== null;

    const getSaleTypeLabel = (type: OrderTypeEnum) => {
        switch (type) {
            case OrderTypeEnum.GROS: return 'Gros';
            case OrderTypeEnum.SEMI_GROS: return 'Semi-gros';
            case OrderTypeEnum.DETAIL: return 'Détail';
        }
    };

    return (
        <Card className="p-5 border-none shadow-sm flex flex-col h-full min-h-[600px] sticky top-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShoppingCartIcon className="size-5 text-primary"/>
                    Panier
                </h3>
                {(items.length > 0 || bundleLines.length > 0) && (
                    <Button variant="ghost" size="icon-sm" onClick={onClearCart} className="text-destructive hover:bg-destructive/10">
                        <TrashIcon className="size-4"/>
                    </Button>
                )}
            </div>

            {hasSelection && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {customer && <Badge variant="secondary" className="bg-primary/10 text-primary border-none"><UserIcon className="size-3"/>{customer.firstname ?? customer.companyName}</Badge>}
                    {customerName && !customer && <Badge variant="outline" className="text-xs"><UserIcon className="size-3"/>{customerName}</Badge>}
                    {table && <Badge variant="outline" className="text-xs"><UtensilsIcon className="size-3"/>{table.label}</Badge>}
                    <Badge variant="outline" className="text-xs">{getSaleTypeLabel(saleType)}</Badge>
                </div>
            )}

            <Separator className="mb-4 bg-border/50"/>

            <div className="flex-auto overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {items.length === 0 && bundleLines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-4">
                        <div className="bg-muted p-4 rounded-full">
                            <ShoppingCartIcon className="size-8 opacity-20"/>
                        </div>
                        <p className="text-sm font-medium">Le panier est vide</p>
                    </div>
                ) : (
                    <>
                        {items.map(item => {
                            const product = products?.find(p => p.id === item.productId);
                            const lineTotal = product ? toBaseUnits(product, item.quantity, item.unit) * item.unitPrice : 0;
                            return (
                                <div key={item.productId} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-xl border border-border/20">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="bg-primary/10 p-1.5 rounded-lg shrink-0">
                                                <WineIcon className="size-3.5 text-primary"/>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold truncate">{product?.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{formatPrice(item.unitPrice)} / unité de base</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-primary whitespace-nowrap">{formatPrice(lineTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-3 bg-background border rounded-lg px-2 py-1">
                                                <button
                                                    onClick={() => onUpdateItemQty(item.productId, item.quantity - 1)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <MinusIcon className="size-3"/>
                                                </button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateItemQty(item.productId, item.quantity + 1)}
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <PlusIcon className="size-3"/>
                                                </button>
                                            </div>
                                            <Select value={item.unit} onValueChange={(v) => onUpdateItemUnit(item.productId, v as MovementUnitEnum)}>
                                                <SelectTrigger size="sm" className="h-7 rounded-lg">
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={MovementUnitEnum.UNIT}>Unité</SelectItem>
                                                    <SelectItem value={MovementUnitEnum.PACK} disabled={!product?.unitsPerPack || product.unitsPerPack <= 0}>Pack</SelectItem>
                                                    <SelectItem value={MovementUnitEnum.CASE} disabled={!product?.unitsPerCase || product.unitsPerCase <= 0}>Casier</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <button
                                            onClick={() => onRemoveItem(item.productId)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <TrashIcon className="size-4"/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {bundleLines.map(line => {
                            const bundle = bundles?.find(b => b.id === line.bundleId);
                            return (
                                <div key={line.bundleId} className="flex flex-col gap-2 p-3 bg-primary/5 rounded-xl border border-primary/15">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="bg-primary/10 p-1.5 rounded-lg shrink-0">
                                                <GiftIcon className="size-3.5 text-primary"/>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold truncate">{bundle?.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{formatPrice(line.unitPrice)} / bundle</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-primary whitespace-nowrap">{formatPrice(line.quantity * line.unitPrice)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-3 bg-background border rounded-lg px-2 py-1">
                                            <button
                                                onClick={() => onUpdateBundleQty(line.bundleId, line.quantity - 1)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <MinusIcon className="size-3"/>
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center">{line.quantity}</span>
                                            <button
                                                onClick={() => onUpdateBundleQty(line.bundleId, line.quantity + 1)}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <PlusIcon className="size-3"/>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => onRemoveBundle(line.bundleId)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <TrashIcon className="size-4"/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            <div className="mt-auto pt-6 space-y-4">
                <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type de vente</span>
                        <span className="font-semibold">{getSaleTypeLabel(saleType)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Produits</span>
                        <span className="font-semibold">{formatPrice(itemTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Bundles</span>
                        <span className="font-semibold">{formatPrice(bundleTotal)}</span>
                    </div>
                    <Separator className="my-2 bg-border/50"/>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">Total</span>
                        <span className="text-xl font-black text-primary">{formatPrice(total)}</span>
                    </div>
                </div>

                <Button
                    className={cn("w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20")}
                    disabled={(items.length === 0 && bundleLines.length === 0) || isSubmitting}
                    onClick={onCheckout}
                >
                    {isSubmitting ? <WaitingActivity size={20}/> : (
                        <>
                            <CheckIcon/>
                            Finaliser la vente
                        </>
                    )}
                </Button>
            </div>
        </Card>
    );
}
