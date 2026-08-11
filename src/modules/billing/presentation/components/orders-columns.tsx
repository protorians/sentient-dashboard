"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@/core/presentation/ui/badge"
import {OrderInterface} from "@/modules/billing/domain/order.interface"
import {ORDER_STATUS_LABELS} from "@/modules/billing/domain/enums/order-status.enum"
import {OrderStatusEnum} from "@/modules/billing/domain/enums/order-status.enum"
import {getDataGridAction} from "@/core/presentation/data-grid/data-grid"
import {Clickable} from "@/core/presentation/clickable"
import {format} from "date-fns"
import {fr} from "date-fns/locale"
import {PackageIcon} from "lucide-react"

const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    try {
        return format(new Date(date), "d MMM yyyy, HH:mm", {locale: fr})
    } catch {
        return 'N/A'
    }
}

const getStatusBadgeVariant = (status: OrderStatusEnum) => {
    switch (status) {
        case OrderStatusEnum.PAID:
            return "default"
        case OrderStatusEnum.CANCELLED:
            return "destructive"
        case OrderStatusEnum.PENDING:
            return "secondary"
        default:
            return "outline"
    }
}

export const getOrderColumns = (): ColumnDef<OrderInterface>[] => [
    {
        accessorKey: "orderNumber",
        header: "N° Commande",
        cell: ({row, table}) => {
            const details = getDataGridAction(table, row.original, "details")
            return (
                <Clickable onClick={() => details?.onExecute(row.original)}>
                    <span className="flex items-center gap-2 font-semibold">
                        <PackageIcon className="size-4 text-muted-foreground"/>
                        {row.original.orderNumber}
                    </span>
                </Clickable>
            )
        },
    },
    {
        accessorKey: "totalAmount",
        header: "Montant",
        cell: ({row}) => (
            <span className="font-semibold">
                {row.original.totalAmount.toLocaleString('fr-FR')} FCFA
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => (
            <Badge variant={getStatusBadgeVariant(row.original.status)} className="px-1.5">
                {ORDER_STATUS_LABELS[row.original.status] ?? row.original.status}
            </Badge>
        ),
    },
    {
        id: "items",
        header: "Articles",
        cell: ({row}) => (
            <span className="text-muted-foreground text-sm">
                {row.original.items?.length ?? 0} article(s)
            </span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Créée le",
        cell: ({row}) => (
            <span className="text-muted-foreground text-sm">
                {formatDate(row.original.createdAt)}
            </span>
        ),
    },
]
