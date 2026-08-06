"use client"

import * as React from "react";
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/core/presentation/ui/badge";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {BundleTypeEnum} from "@/modules/beverage-sales/domain/enums/bundle-type.enum";
import {getDataGridAction} from "@/core/presentation/data-grid/data-grid";
import {Clickable} from "@/core/presentation/clickable";
import {FlaskConicalIcon, BookOpenIcon, GiftIcon, BoxesIcon, LayersIcon} from "lucide-react";
import {formatPrice, getBundleUnitPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

export const TYPE_LABELS: Record<BundleTypeEnum, string> = {
    [BundleTypeEnum.COMPOSITION]: 'Composition',
    [BundleTypeEnum.RECIPE]: 'Recette',
    [BundleTypeEnum.BUNDLE]: 'Bundle',
    [BundleTypeEnum.KIT]: 'Kit',
};

const TYPE_ICONS: Record<BundleTypeEnum, typeof LayersIcon> = {
    [BundleTypeEnum.COMPOSITION]: FlaskConicalIcon,
    [BundleTypeEnum.RECIPE]: BookOpenIcon,
    [BundleTypeEnum.BUNDLE]: GiftIcon,
    [BundleTypeEnum.KIT]: BoxesIcon,
};

export const getBundleColumns = (): ColumnDef<BundleInterface>[] => [
    {
        accessorKey: "name",
        header: "Nom",
        cell: ({row, table}) => {
            const edit = getDataGridAction(table, row.original, "edit");
            return (
                <div className="flex flex-col gap-0.5 min-w-0">
                    <Clickable onClick={() => edit?.onExecute(row.original)}>
                        <span className="font-semibold line-clamp-1">{row.original.name}</span>
                    </Clickable>
                    {row.original.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "sku",
        header: "Référence",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.sku || '—'}
            </Badge>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({row}) => {
            const Icon = TYPE_ICONS[row.original.type] ?? LayersIcon;
            return (
                <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground"/>
                    <span>{TYPE_LABELS[row.original.type] ?? row.original.type}</span>
                </div>
            );
        },
    },
    {
        id: "components",
        header: "Composants",
        cell: ({row}) => {
            const items = row.original.items ?? [];
            const preview = items.slice(0, 2).map(i => `${i.quantity}× ${i.productName}`).join(', ');
            const rest = items.length - 2;
            return (
                <div className="flex items-center gap-1.5 min-w-0">
                    <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary border-none">
                        {items.length}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                        {preview}{rest > 0 ? ` +${rest}` : ''}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "price",
        header: "Prix",
        cell: ({row}) => {
            const unitPrice = getBundleUnitPrice(row.original);
            const isAuto = row.original.price === 0;
            return (
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold whitespace-nowrap">{formatPrice(isAuto ? unitPrice : row.original.price)}</span>
                    {isAuto && <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 h-4 bg-muted/50 border-none text-muted-foreground">auto</Badge>}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => (
            <Badge variant="outline" className={row.original.status ? "bg-green-500/10 text-green-600 border-none" : "bg-muted text-muted-foreground border-none"}>
                {row.original.status ? 'Actif' : 'Inactif'}
            </Badge>
        ),
    },
];
