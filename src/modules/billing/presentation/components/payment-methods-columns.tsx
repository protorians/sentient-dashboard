"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@/core/presentation/ui/badge"
import {PaymentMethodInterface} from "@/modules/billing/domain/payment-method.interface"
import {PAYMENT_METHOD_TYPE_LABELS} from "@/modules/billing/domain/enums/payment-method-type.enum"
import {getDataGridAction} from "@/core/presentation/data-grid/data-grid"
import {Clickable} from "@/core/presentation/clickable"
import {format} from "date-fns"
import {fr} from "date-fns/locale"
import {CreditCardIcon, ShieldCheckIcon, ShieldAlertIcon} from "lucide-react"

const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    try {
        return format(new Date(date), "d MMM yyyy", {locale: fr})
    } catch {
        return 'N/A'
    }
}

export const getPaymentMethodColumns = (): ColumnDef<PaymentMethodInterface>[] => [
    {
        accessorKey: "name",
        header: "Nom",
        cell: ({row, table}) => {
            const edit = getDataGridAction(table, row.original, "edit")
            return (
                <Clickable onClick={() => edit?.onExecute(row.original)}>
                    <span className="flex items-center gap-2 font-semibold">
                        <CreditCardIcon className="size-4 text-muted-foreground"/>
                        {row.original.name}
                    </span>
                </Clickable>
            )
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({row}) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {PAYMENT_METHOD_TYPE_LABELS[row.original.type] ?? row.original.type}
            </Badge>
        ),
    },
    {
        id: "fees",
        header: "Frais",
        cell: ({row}) => {
            const {feeRate, feeAmount} = row.original
            if (!feeRate && !feeAmount) return <span className="text-muted-foreground">—</span>
            return (
                <span className="text-muted-foreground text-sm">
                    {feeRate > 0 ? `${feeRate}%` : ""}
                    {feeRate > 0 && feeAmount > 0 ? " · " : ""}
                    {feeAmount > 0 ? `${feeAmount.toLocaleString('fr-FR')} FCFA` : ""}
                </span>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => {
            const active = row.original.status !== false
            return (
                <Badge variant="outline" className="px-1.5">
                    {active ? (
                        <ShieldCheckIcon className="size-4 text-emerald-500 mr-1"/>
                    ) : (
                        <ShieldAlertIcon className="size-4 text-muted-foreground mr-1"/>
                    )}
                    {active ? 'Actif' : 'Inactif'}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Créé le",
        cell: ({row}) => (
            <span className="text-muted-foreground text-sm">
                {formatDate(row.original.createdAt)}
            </span>
        ),
    },
]
