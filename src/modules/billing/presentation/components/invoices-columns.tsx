"use client"

import * as React from "react"
import {type ColumnDef} from "@tanstack/react-table"
import {Badge} from "@/core/presentation/ui/badge"
import {InvoiceInterface} from "@/modules/billing/domain/invoice.interface"
import {INVOICE_STATUS_LABELS} from "@/modules/billing/domain/enums/invoice-status.enum"
import {InvoiceStatusEnum} from "@/modules/billing/domain/enums/invoice-status.enum"
import {getDataGridAction} from "@/core/presentation/data-grid/data-grid"
import {Clickable} from "@/core/presentation/clickable"
import {format} from "date-fns"
import {fr} from "date-fns/locale"
import {FileTextIcon} from "lucide-react"

const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    try {
        return format(new Date(date), "d MMM yyyy, HH:mm", {locale: fr})
    } catch {
        return 'N/A'
    }
}

const getStatusBadgeVariant = (status: InvoiceStatusEnum) => {
    switch (status) {
        case InvoiceStatusEnum.PAID:
            return "default"
        case InvoiceStatusEnum.OVERDUE:
            return "destructive"
        case InvoiceStatusEnum.CANCELLED:
            return "secondary"
        case InvoiceStatusEnum.UNPAID:
            return "outline"
        default:
            return "outline"
    }
}

export const getInvoiceColumns = (): ColumnDef<InvoiceInterface>[] => [
    {
        accessorKey: "invoiceNumber",
        header: "N° Facture",
        cell: ({row, table}) => {
            const details = getDataGridAction(table, row.original, "details")
            return (
                <Clickable onClick={() => details?.onExecute(row.original)}>
                    <span className="flex items-center gap-2 font-semibold">
                        <FileTextIcon className="size-4 text-muted-foreground"/>
                        {row.original.invoiceNumber}
                    </span>
                </Clickable>
            )
        },
    },
    {
        accessorKey: "amount",
        header: "Montant",
        cell: ({row}) => (
            <span className="font-semibold">
                {row.original.amount.toLocaleString('fr-FR')} FCFA
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({row}) => (
            <Badge variant={getStatusBadgeVariant(row.original.status)} className="px-1.5">
                {INVOICE_STATUS_LABELS[row.original.status] ?? row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "transactionFee",
        header: "Frais",
        cell: ({row}) => {
            const fee = row.original.transactionFee
            if (!fee) return <span className="text-muted-foreground">—</span>
            return (
                <span className="text-muted-foreground text-sm">
                    {fee.toLocaleString('fr-FR')} FCFA
                </span>
            )
        },
    },
    {
        accessorKey: "dueDate",
        header: "Échéance",
        cell: ({row}) => (
            <span className="text-muted-foreground text-sm">
                {row.original.dueDate ? formatDate(row.original.dueDate) : '—'}
            </span>
        ),
    },
    {
        accessorKey: "paidAt",
        header: "Payée le",
        cell: ({row}) => (
            <span className="text-muted-foreground text-sm">
                {row.original.paidAt ? formatDate(row.original.paidAt) : '—'}
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
