"use client"

import React, {useEffect, useRef} from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {BundleTypeEnum} from "@/modules/beverage-sales/domain/enums/bundle-type.enum";
import {CreateBundleItemInterface} from "@/modules/beverage-sales/domain/bundle-item.interface";
import {Button} from "@/core/presentation/ui/button";
import {Input} from "@/core/presentation/ui/input";
import {Textarea} from "@/core/presentation/ui/textarea";
import {Label} from "@/core/presentation/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {useModalStepper, ModalStepperStep} from "@/core/presentation/modals/components/ModalStepper";
import {PlusIcon, TrashIcon} from "lucide-react";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

interface BundleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products?: ProductInterface[];
    isLoadingProducts?: boolean;
    bundle?: BundleInterface | null;
    nextSku?: string;
    onSave: (payload: { name: string; sku?: string; description?: string; type: BundleTypeEnum; price?: number; items: CreateBundleItemInterface[] }) => Promise<void>;
    isSaving?: boolean;
}

interface BundleFormData {
    name: string;
    sku: string;
    description: string;
    type: BundleTypeEnum;
    price: number;
    items: CreateBundleItemInterface[];
}

const newItem = (): CreateBundleItemInterface => ({productId: '', quantity: 1});

export function BundleFormDialog({open, onOpenChange, products, isLoadingProducts, bundle, nextSku, onSave}: BundleFormDialogProps) {
    const openStepper = useModalStepper<BundleFormData>();
    const runningRef = useRef(false);

    useEffect(() => {
        if (!open) {
            runningRef.current = false;
            return;
        }
        if (runningRef.current) return;
        runningRef.current = true;

        const isEdit = !!bundle;
        const initialData: BundleFormData = {
            name: bundle?.name ?? '',
            sku: bundle?.sku ?? nextSku ?? '',
            description: bundle?.description ?? '',
            type: bundle?.type ?? BundleTypeEnum.KIT,
            price: bundle && bundle.price > 0 ? bundle.price : 0,
            items: bundle && bundle.items.length > 0
                ? bundle.items.map(i => ({productId: i.productId, quantity: i.quantity}))
                : [newItem()],
        };

        const computedPrice = (items: CreateBundleItemInterface[]) =>
            items.reduce((sum, item) => {
                const product = products?.find(p => p.id === item.productId);
                return sum + ((product?.salePrice ?? 0) * item.quantity);
            }, 0);

        const steps: ModalStepperStep<BundleFormData>[] = [
            {
                id: 'info',
                title: 'Informations',
                description: 'Nom, type, SKU et prix du bundle',
                required: true,
                content: ({data, updateData}) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <Label htmlFor="bundle-name">Nom *</Label>
                            <Input
                                id="bundle-name"
                                required
                                placeholder="Ex : Pack fête, Caisse premium..."
                                value={data.name ?? ''}
                                onChange={(e) => updateData({name: e.target.value})}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <Label htmlFor="bundle-type">Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(v) => updateData({type: v as BundleTypeEnum})}
                            >
                                <SelectTrigger id="bundle-type">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={BundleTypeEnum.COMPOSITION}>Composition</SelectItem>
                                    <SelectItem value={BundleTypeEnum.RECIPE}>Recette</SelectItem>
                                    <SelectItem value={BundleTypeEnum.BUNDLE}>Bundle</SelectItem>
                                    <SelectItem value={BundleTypeEnum.KIT}>Kit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="bundle-sku">SKU</Label>
                            <Input
                                id="bundle-sku"
                                placeholder="Ex : BND-001"
                                value={data.sku ?? ''}
                                onChange={(e) => updateData({sku: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="bundle-price">Prix personnalisé (FCFA)</Label>
                            <Input
                                id="bundle-price"
                                type="number"
                                min={0}
                                placeholder={computedPrice(initialData.items) > 0 ? `Auto : ${formatPrice(computedPrice(initialData.items))}` : '0 = calcul auto'}
                                value={data.price ? String(data.price) : ''}
                                onChange={(e) => updateData({price: e.target.value ? Number(e.target.value) : 0})}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <Label htmlFor="bundle-description">Description</Label>
                            <Textarea
                                id="bundle-description"
                                placeholder="Description optionnelle"
                                value={data.description ?? ''}
                                onChange={(e) => updateData({description: e.target.value})}
                            />
                        </div>
                    </div>
                ),
                validation: async (data) => {
                    if (!data.name?.trim()) throw new Error('Le nom du kit est obligatoire');
                },
            },
            {
                id: 'items',
                title: 'Boissons',
                description: 'Composez le kit',
                required: true,
                content: ({data, updateData}) => {
                    const items = data.items ?? [];
                    const updateItem = (index: number, patch: Partial<CreateBundleItemInterface>) => {
                        updateData({items: items.map((item, idx) => idx === index ? {...item, ...patch} : item)});
                    };
                    const removeItem = (index: number) => {
                        updateData({items: items.length === 1 ? items : items.filter((_, idx) => idx !== index)});
                    };
                    return (
                        <div className="flex flex-col gap-2">
                            {items.map((item, index) => {
                                const selectedProduct = products?.find(p => p.id === item.productId);
                                return (
                                    <div key={index} className="flex items-center gap-2 bg-muted/40 rounded-xl p-2 border border-border/20">
                                        <Select
                                            value={item.productId || undefined}
                                            onValueChange={(v) => updateItem(index, {productId: v})}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Choisir une boisson"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isLoadingProducts ? (
                                                    <div className="flex justify-center p-3"><WaitingActivity size={20}/></div>
                                                ) : products?.map(product => (
                                                    <SelectItem key={product.id} value={product.id!}>
                                                        {product.name}
                                                        {product.salePrice ? ` — ${formatPrice(product.salePrice)}` : ' — sans prix'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, {quantity: Math.max(1, Number(e.target.value))})}
                                            className="w-20 text-center"
                                        />
                                        <span className="text-xs text-muted-foreground w-24 text-right whitespace-nowrap">
                                            {selectedProduct?.salePrice ? formatPrice(selectedProduct.salePrice * item.quantity) : '—'}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => removeItem(index)}
                                        >
                                            <TrashIcon className="size-4"/>
                                        </Button>
                                    </div>
                                );
                            })}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="self-start"
                                onClick={() => updateData({items: [...items, newItem()]})}
                            >
                                <PlusIcon/>
                                Ajouter une boisson
                            </Button>
                        </div>
                    );
                },
                validation: async (data) => {
                    const valid = (data.items ?? []).filter(i => i.productId && i.quantity > 0);
                    if (valid.length === 0) throw new Error('Ajoutez au moins une boisson');
                },
            },
            {
                id: 'summary',
                title: 'Récapitulatif',
                description: 'Vérifiez avant de créer',
                content: ({data}) => {
                    const items = (data.items ?? []).filter(i => i.productId);
                    const total = data.price && data.price > 0 ? data.price : computedPrice(items);
                    return (
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3 bg-muted/40 rounded-xl p-4">
                                <div className="flex flex-col gap-0.5">
                                    <Label className="text-xs text-muted-foreground">Nom</Label>
                                    <p className="font-semibold">{data.name}</p>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <Label className="text-xs text-muted-foreground">SKU</Label>
                                    <p className="font-semibold">{data.sku || '—'}</p>
                                </div>
                        <div className="flex flex-col gap-0.5">
                            <Label className="text-xs text-muted-foreground">Type</Label>
                            <p className="font-semibold">{data.type}</p>
                        </div>
                                <div className="flex flex-col gap-0.5">
                                    <Label className="text-xs text-muted-foreground">Prix</Label>
                                    <p className="font-semibold">
                                        {data.price && data.price > 0 ? formatPrice(data.price) : `Calculé (${formatPrice(total)})`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-muted-foreground">Composants</Label>
                                <div className="flex flex-col gap-1.5">
                                    {items.map((item, index) => {
                                        const product = products?.find(p => p.id === item.productId);
                                        return (
                                            <div key={index} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                                                <span className="font-medium">{product?.name ?? 'Produit inconnu'}</span>
                                                <span className="text-muted-foreground">×{item.quantity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
                                <span className="font-medium">Total</span>
                                <span className="font-bold text-primary">{formatPrice(total)}</span>
                            </div>
                        </div>
                    );
                },
            },
        ];

        const promise = openStepper({
            steps,
            title: isEdit ? 'Modifier le bundle' : 'Nouveau bundle',
            initialData,
            onEnd: async ({data}) => {
                const validItems = (data.items ?? []).filter(i => i.productId && i.quantity > 0);
                await onSave({
                    name: (data.name ?? '').trim(),
                    sku: (data.sku ?? '').trim() || undefined,
                    description: (data.description ?? '').trim() || undefined,
                    type: data.type ?? BundleTypeEnum.KIT,
                    price: data.price && data.price > 0 ? data.price : 0,
                    items: validItems,
                });
            },
        });

        promise.finally(() => {
            onOpenChange(false);
        });
    }, [open, bundle, nextSku, products, isLoadingProducts, onSave, onOpenChange, openStepper]);

    return null;
}
