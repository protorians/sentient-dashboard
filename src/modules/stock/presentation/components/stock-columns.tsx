"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {
    PackageIcon,
    ShieldAlertIcon,
    ShieldCheckIcon,
} from "lucide-react"

import {Badge} from "@/core/presentation/ui/badge";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {getDataGridAction} from "@/core/presentation/data-grid/data-grid";
import {Clickable} from "@/core/presentation/clickable";
import {ProductTypeEnum} from "@/modules/stock/domain/enums/product-type.enum";
import {formatQuantity, isLowStock} from "@/modules/stock/infrastructure/utilities/stock-data.util";

export const getStockColumns = (): ColumnDef<ProductInterface>[] => [
    {
        accessorKey: "name",
        header: "Produit",
        cell: ({row, table}) => {
            const details = getDataGridAction(table, row.original, "details")
            return (
                <Clickable onClick={() => details?.onExecute(row.original)}>
                    <span className="font-semibold">{row.original.name}</span>
                </Clickable>
            )
        },
    },
    {
        accessorKey: "sku",
        header: "Référence",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.sku || 'N/A'}
            </Badge>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({row}) => (
            <div className="flex items-center gap-2">
                <PackageIcon className="size-4 text-muted-foreground"/>
                {row.original.type === ProductTypeEnum.PHYSICAL ? 'Physique' : 'Numérique'}
            </div>
        ),
    },
    {
        accessorKey: "isPerishable",
        header: "Périssable",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.isPerishable ? 'Oui' : 'Non'}
            </Badge>
        ),
    },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({row}) => {
            const low = isLowStock(row.original)
            return (
                <div className="flex items-center gap-2">
                    {low
                        ? <ShieldAlertIcon className="size-4 text-rose-500"/>
                        : <ShieldCheckIcon className="size-4 text-emerald-500"/>}
                    <span className={low ? "text-rose-500 font-medium" : ""}>
                        {formatQuantity(row.original.stock?.quantity)}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => {
            const active = row.original.status !== false
            return (
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {active ? (
                        <ShieldCheckIcon className="size-4 text-emerald-500 mr-1"/>
                    ) : (
                        <PackageIcon className="size-4 text-muted-foreground mr-1"/>
                    )}
                    {active ? 'Actif' : 'Inactif'}
                </Badge>
            )
        },
    },
];
