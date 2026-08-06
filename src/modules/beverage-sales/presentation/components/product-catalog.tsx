"use client"

import React, {useState} from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {Input} from "@/core/presentation/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {WineIcon, SearchIcon, PlusIcon, BeerIcon, PackageIcon, BoxesIcon} from "lucide-react";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

interface ProductCatalogProps {
    products?: ProductInterface[];
    isLoading?: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAdd: (product: ProductInterface, unit: MovementUnitEnum, unitPrice: number) => void;
}

const UNIT_ICONS: Record<MovementUnitEnum, typeof BeerIcon> = {
    [MovementUnitEnum.UNIT]: BeerIcon,
    [MovementUnitEnum.PACK]: PackageIcon,
    [MovementUnitEnum.CASE]: BoxesIcon,
};

export function ProductCatalog({products, isLoading, searchTerm, onSearchChange, onAdd}: ProductCatalogProps) {
    const [unit, setUnit] = useState<MovementUnitEnum>(MovementUnitEnum.UNIT);

    const filtered = products?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.type ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getUnitPrice = (product: ProductInterface) => {
        const factor = unit === MovementUnitEnum.PACK ? product.unitsPerPack : unit === MovementUnitEnum.CASE ? product.unitsPerCase : 1;
        return (product.salePrice ?? 0) * (factor && factor > 0 ? factor : 1);
    };

    const canSelectUnit = (product: ProductInterface, candidate: MovementUnitEnum) => {
        if (candidate === MovementUnitEnum.UNIT) return true;
        const factor = candidate === MovementUnitEnum.PACK ? product.unitsPerPack : product.unitsPerCase;
        return !!factor && factor > 0;
    };

    return (
        <Card className="p-6 border-none shadow-sm flex-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl">
                        <WineIcon className="size-5 text-primary"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Boissons du dépôt</h3>
                        <p className="text-xs text-muted-foreground">Sélectionnez un produit et son unité de vente</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                        <Input
                            placeholder="Rechercher une boisson..."
                            className="pl-9 h-10 rounded-xl bg-muted/50 border-none"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Select value={unit} onValueChange={(v) => setUnit(v as MovementUnitEnum)}>
                        <SelectTrigger className="h-10 w-28 rounded-xl">
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
                <div className="flex-auto flex items-center justify-center p-12">
                    <WaitingActivity size={32}/>
                </div>
            ) : filtered?.length === 0 ? (
                <div className="flex-auto flex items-center justify-center p-12 text-muted-foreground text-sm">
                    Aucune boisson trouvée
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered?.map(product => {
                        const UnitIcon = UNIT_ICONS[unit];
                        const activePrice = getUnitPrice(product);
                        return (
                            <div
                                key={product.id}
                                className="group relative bg-background border border-border/50 rounded-2xl p-3 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer flex flex-col gap-2"
                                onClick={() => onAdd(product, unit, activePrice)}
                            >
                                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center mb-1 overflow-hidden">
                                    <UnitIcon className="size-10 text-muted-foreground/30 group-hover:scale-110 transition-transform"/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                        {product.sku ?? product.type}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs font-bold text-primary">
                                        {product.salePrice ? formatPrice(activePrice) : '—'}
                                    </span>
                                    <div className="bg-primary/10 text-primary p-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PlusIcon className="size-3"/>
                                    </div>
                                </div>
                                {product.salePrice === 0 && (
                                    <span className="absolute top-2 right-2 text-[9px] font-bold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-lg">
                                        Sans prix
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
