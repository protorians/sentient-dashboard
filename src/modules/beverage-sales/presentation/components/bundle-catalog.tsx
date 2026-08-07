"use client"

import React from "react";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {BundleTypeEnum} from "@/modules/beverage-sales/domain/enums/bundle-type.enum";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {PackageOpenIcon, PlusIcon, GiftIcon, FlaskConicalIcon, BookOpenIcon, BoxesIcon, LayersIcon} from "lucide-react";
import {formatPrice, getBundleUnitPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";
import {cn} from "@/core/infrastructure/utilities/utils";

interface BundleCatalogProps {
    bundles?: BundleInterface[];
    isLoading?: boolean;
    onAdd: (bundle: BundleInterface, unitPrice: number) => void;
    isReadOnly?: boolean;
}

const TYPE_ICONS: Record<BundleTypeEnum, typeof LayersIcon> = {
    [BundleTypeEnum.COMPOSITION]: FlaskConicalIcon,
    [BundleTypeEnum.RECIPE]: BookOpenIcon,
    [BundleTypeEnum.BUNDLE]: GiftIcon,
    [BundleTypeEnum.KIT]: BoxesIcon,
};

export function BundleCatalog({bundles, isLoading, onAdd, isReadOnly}: BundleCatalogProps) {
    if (isLoading) {
        return (
            <Card className="p-6 border-none shadow-sm flex items-center justify-center min-h-40">
                <WaitingActivity size={28}/>
            </Card>
        );
    }

    if (!bundles || bundles.length === 0) {
        return (
            <Card className="p-6 border-none shadow-sm flex items-center justify-center min-h-40 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                    <PackageOpenIcon className="size-8 opacity-30"/>
                    <p className="text-sm font-medium">Aucun bundle configuré pour le moment</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {bundles.map(bundle => {
                const TypeIcon = TYPE_ICONS[bundle.type] ?? LayersIcon;
                const unitPrice = getBundleUnitPrice(bundle);
                return (
                    <div
                        key={bundle.id}
                        className={cn(
                            "group relative bg-background border border-border/50 rounded-2xl p-3 transition-all hover:shadow-md flex flex-col gap-2",
                            isReadOnly ? "opacity-60 cursor-not-allowed" : "hover:border-primary/50 cursor-pointer"
                        )}
                        onClick={() => !isReadOnly && onAdd(bundle, unitPrice)}
                    >
                        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center mb-1 overflow-hidden">
                            <TypeIcon className="size-10 text-muted-foreground/30 group-hover:scale-110 transition-transform"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{bundle.name}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                {bundle.items.length} composant{bundle.items.length > 1 ? 's' : ''} · {bundle.type}
                            </p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-bold text-primary">
                                {bundle.price > 0 ? formatPrice(bundle.price) : unitPrice > 0 ? formatPrice(unitPrice) : '—'}
                            </span>
                            <div className="bg-primary/10 text-primary p-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                <PlusIcon className="size-3"/>
                            </div>
                        </div>
                        {bundle.price === 0 && (
                            <span className="absolute top-2 right-2 text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg">
                                Auto
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
