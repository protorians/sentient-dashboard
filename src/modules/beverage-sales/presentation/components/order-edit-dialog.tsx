"use client"

import React, {useEffect, useState} from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {OrderInterface, UpdateOrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";
import {CartItemLine, CartBundleLine} from "@/modules/beverage-sales/domain/cart.types";
import {Button} from "@/core/presentation/ui/button";
import {Badge} from "@/core/presentation/ui/badge";
import {Label} from "@/core/presentation/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/core/presentation/ui/dialog";
import {
    PlusIcon,
    MinusIcon,
    TrashIcon,
    WineIcon,
    GiftIcon,
    ReceiptTextIcon,
} from "lucide-react";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {cn} from "@/core/infrastructure/utilities/utils";
import {formatPrice, toBaseUnits, getBundleUnitPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

interface OrderEditDialogProps {
    order: OrderInterface | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products?: ProductInterface[];
    bundles?: BundleInterface[];
    isSaving?: boolean;
    onSave: (order: OrderInterface, payload: UpdateOrderInterface) => void;
}

export function OrderEditDialog({order, open, onOpenChange, products, bundles, isSaving, onSave}: OrderEditDialogProps) {
    const [items, setItems] = useState<CartItemLine[]>([]);
    const [bundleLines, setBundleLines] = useState<CartBundleLine[]>([]);
    const [addProductId, setAddProductId] = useState('');
    const [addProductUnit, setAddProductUnit] = useState<MovementUnitEnum>(MovementUnitEnum.UNIT);
    const [addBundleId, setAddBundleId] = useState('');

    useEffect(() => {
        if (!open || !order) return;
        setItems(order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
        })));
        setBundleLines(order.bundles.map(bundle => ({
            bundleId: bundle.bundleId,
            quantity: bundle.quantity,
            unitPrice: bundle.unitPrice,
        })));
        setAddProductId('');
        setAddBundleId('');
    }, [open, order]);

    if (!order) return null;

    const updateItemQty = (productId: string, quantity: number) => {
        setItems(prev => quantity <= 0
            ? prev.filter(item => item.productId !== productId)
            : prev.map(item => item.productId === productId ? {...item, quantity} : item));
    };

    const updateItemUnit = (productId: string, unit: MovementUnitEnum) => {
        setItems(prev => prev.map(item => item.productId === productId ? {...item, unit} : item));
    };

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const addItem = () => {
        const product = products?.find(p => p.id === addProductId);
        if (!product?.id) return;
        const factor = addProductUnit === MovementUnitEnum.PACK ? product.unitsPerPack : addProductUnit === MovementUnitEnum.CASE ? product.unitsPerCase : 1;
        const unitPrice = (product.salePrice ?? 0) * (factor && factor > 0 ? factor : 1);
        setItems(prev => {
            const existing = prev.find(item => item.productId === product.id && item.unit === addProductUnit);
            if (existing) {
                return prev.map(item => item.productId === product.id ? {...item, quantity: item.quantity + 1} : item);
            }
            return [...prev, {productId: product.id!, quantity: 1, unit: addProductUnit, unitPrice}];
        });
    };

    const updateBundleQty = (bundleId: string, quantity: number) => {
        setBundleLines(prev => quantity <= 0
            ? prev.filter(line => line.bundleId !== bundleId)
            : prev.map(line => line.bundleId === bundleId ? {...line, quantity} : line));
    };

    const removeBundle = (bundleId: string) => {
        setBundleLines(prev => prev.filter(line => line.bundleId !== bundleId));
    };

    const addBundle = () => {
        const bundle = bundles?.find(b => b.id === addBundleId);
        if (!bundle?.id) return;
        const unitPrice = getBundleUnitPrice(bundle);
        setBundleLines(prev => {
            const existing = prev.find(line => line.bundleId === bundle.id);
            if (existing) {
                return prev.map(line => line.bundleId === bundle.id ? {...line, quantity: line.quantity + 1} : line);
            }
            return [...prev, {bundleId: bundle.id, quantity: 1, unitPrice}];
        });
    };

    const itemTotal = items.reduce((sum, item) => {
        const product = products?.find(p => p.id === item.productId);
        return sum + (product ? toBaseUnits(product, item.quantity, item.unit) * item.unitPrice : 0);
    }, 0);

    const bundleTotal = bundleLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
    const total = itemTotal + bundleTotal;

    const canSave = items.length > 0 || bundleLines.length > 0;

    const handleSave = () => {
        onSave(order, {
            items: items.map(item => ({productId: item.productId, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice})),
            bundles: bundleLines.map(line => ({bundleId: line.bundleId, quantity: line.quantity})),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ReceiptTextIcon className="size-5 text-primary"/>
                        Modifier la commande {order.orderNumber}
                    </DialogTitle>
                    <DialogDescription>
                        La commande est en attente — vous pouvez ajuster les produits, bundles et quantités.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {items.map(item => {
                        const product = products?.find(p => p.id === item.productId);
                        const lineTotal = product ? toBaseUnits(product, item.quantity, item.unit) * item.unitPrice : 0;
                        return (
                            <div key={`item-${item.productId}`} className="flex items-center justify-between gap-2 bg-muted/40 rounded-xl p-2 border border-border/20">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="bg-primary/10 p-1.5 rounded-lg shrink-0">
                                        <WineIcon className="size-3.5 text-primary"/>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold truncate">{product?.name ?? item.productId}</span>
                                        <span className="text-[10px] text-muted-foreground">{formatPrice(item.unitPrice)} / unité de base</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={item.unit} onValueChange={(v) => updateItemUnit(item.productId, v as MovementUnitEnum)}>
                                        <SelectTrigger size="sm" className="h-7 rounded-lg w-24">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={MovementUnitEnum.UNIT}>Unité</SelectItem>
                                            <SelectItem value={MovementUnitEnum.PACK} disabled={!product?.unitsPerPack || product.unitsPerPack <= 0}>Pack</SelectItem>
                                            <SelectItem value={MovementUnitEnum.CASE} disabled={!product?.unitsPerCase || product.unitsPerCase <= 0}>Casier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-3 bg-background border rounded-lg px-2 py-1">
                                        <button onClick={() => updateItemQty(item.productId, item.quantity - 1)} className="text-muted-foreground hover:text-destructive transition-colors">
                                            <MinusIcon className="size-3"/>
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateItemQty(item.productId, item.quantity + 1)} className="text-muted-foreground hover:text-primary transition-colors">
                                            <PlusIcon className="size-3"/>
                                        </button>
                                    </div>
                                    <span className="text-sm font-bold text-primary w-20 text-right whitespace-nowrap">{formatPrice(lineTotal)}</span>
                                    <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors">
                                        <TrashIcon className="size-4"/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {bundleLines.map(line => {
                        const bundle = bundles?.find(b => b.id === line.bundleId);
                        return (
                            <div key={`bundle-${line.bundleId}`} className="flex items-center justify-between gap-2 bg-primary/5 rounded-xl p-2 border border-primary/15">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="bg-primary/10 p-1.5 rounded-lg shrink-0">
                                        <GiftIcon className="size-3.5 text-primary"/>
                                    </div>
                                    <span className="text-sm font-bold truncate">{bundle?.name ?? line.bundleId}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-3 bg-background border rounded-lg px-2 py-1">
                                        <button onClick={() => updateBundleQty(line.bundleId, line.quantity - 1)} className="text-muted-foreground hover:text-destructive transition-colors">
                                            <MinusIcon className="size-3"/>
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{line.quantity}</span>
                                        <button onClick={() => updateBundleQty(line.bundleId, line.quantity + 1)} className="text-muted-foreground hover:text-primary transition-colors">
                                            <PlusIcon className="size-3"/>
                                        </button>
                                    </div>
                                    <span className="text-sm font-bold text-primary w-20 text-right whitespace-nowrap">{formatPrice(line.quantity * line.unitPrice)}</span>
                                    <button onClick={() => removeBundle(line.bundleId)} className="text-muted-foreground hover:text-destructive transition-colors">
                                        <TrashIcon className="size-4"/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 flex flex-col gap-1.5">
                            <Label htmlFor="edit-add-product">Ajouter un produit</Label>
                            <Select value={addProductId || undefined} onValueChange={setAddProductId}>
                                <SelectTrigger id="edit-add-product" className="w-full">
                                    <SelectValue placeholder="Choisir une boisson"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {products?.map(product => (
                                        <SelectItem key={product.id} value={product.id!}>
                                            {product.name}
                                            {product.salePrice ? ` — ${formatPrice(product.salePrice)}` : ' — sans prix'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Select value={addProductUnit} onValueChange={(v) => setAddProductUnit(v as MovementUnitEnum)}>
                            <SelectTrigger className="w-24 h-10 rounded-xl">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={MovementUnitEnum.UNIT}>Unité</SelectItem>
                                <SelectItem value={MovementUnitEnum.PACK}>Pack</SelectItem>
                                <SelectItem value={MovementUnitEnum.CASE}>Casier</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={addItem} disabled={!addProductId} className="h-10 w-10 rounded-xl shrink-0">
                            <PlusIcon className="size-4"/>
                        </Button>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-1 flex flex-col gap-1.5">
                            <Label htmlFor="edit-add-bundle">Ajouter un bundle</Label>
                            <Select value={addBundleId || undefined} onValueChange={setAddBundleId}>
                                <SelectTrigger id="edit-add-bundle" className="w-full">
                                    <SelectValue placeholder="Choisir un bundle"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {bundles?.map(bundle => (
                                        <SelectItem key={bundle.id} value={bundle.id}>
                                            {bundle.name}
                                            {bundle.price > 0 ? ` — ${formatPrice(bundle.price)}` : ' — prix auto'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="icon" onClick={addBundle} disabled={!addBundleId} className="h-10 w-10 rounded-xl shrink-0">
                            <PlusIcon className="size-4"/>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm bg-muted/50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 h-5 bg-muted/50 border-none text-muted-foreground">
                            En attente
                        </Badge>
                        <span className="text-muted-foreground">{items.length + bundleLines.length} ligne(s)</span>
                    </div>
                    <span className="font-black text-primary text-base">{formatPrice(total)}</span>
                </div>

                <DialogFooter showCloseButton>
                    <Button onClick={handleSave} disabled={!canSave || isSaving}>
                        {isSaving ? <WaitingActivity size={18}/> : 'Enregistrer les modifications'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
