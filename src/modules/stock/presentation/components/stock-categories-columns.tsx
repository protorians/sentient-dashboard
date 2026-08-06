"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {
    FolderTreeIcon,
    ShieldCheckIcon,
} from "lucide-react"

import {Badge} from "@/core/presentation/ui/badge";
import {ProductCategoryInterface} from "@/modules/stock/domain/product-category.interface";
import {getDataGridAction} from "@/core/presentation/data-grid/data-grid";
import {Clickable} from "@/core/presentation/clickable";
import {format} from "date-fns";
import {fr} from "date-fns/locale";

const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    try {
        return format(new Date(date), "d MMM yyyy", {locale: fr});
    } catch {
        return 'N/A';
    }
};

export const getStockCategoriesColumns = (): ColumnDef<ProductCategoryInterface>[] => [
    {
        accessorKey: "name",
        header: "Catégorie",
        cell: ({row, table}) => {
            const edit = getDataGridAction(table, row.original, "edit")
            return (
                <Clickable onClick={() => edit?.onExecute(row.original)}>
                    <span className="flex items-center gap-2 font-semibold">
                        <FolderTreeIcon className="size-4 text-muted-foreground"/>
                        {row.original.name}
                    </span>
                </Clickable>
            )
        },
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({row}) => (
            <span className="text-muted-foreground">
                {row.original.description || '—'}
            </span>
        ),
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
                        <FolderTreeIcon className="size-4 text-muted-foreground mr-1"/>
                    )}
                    {active ? 'Actif' : 'Inactif'}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Créée le",
        cell: ({row}) => (
            <span className="text-muted-foreground">
                {formatDate(row.original.createdAt)}
            </span>
        ),
    },
];
