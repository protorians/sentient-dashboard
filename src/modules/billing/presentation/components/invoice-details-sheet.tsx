"use client"

import React from "react"
import {LegacySheet} from "@/core/presentation/sheets/legacy-sheet"
import {Badge} from "@/core/presentation/ui/badge"
import {Separator} from "@/core/presentation/ui/separator"
import {InvoiceInterface} from "@/modules/billing/domain/invoice.interface"
import {INVOICE_STATUS_LABELS} from "@/modules/billing/domain/enums/invoice-status.enum"
import {InvoiceStatusEnum} from "@/modules/billing/domain/enums/invoice-status.enum"
import {format} from "date-fns"
import {fr} from "date-fns/locale"
import {FileTextIcon, CalendarIcon, CreditCardIcon} from "lucide-react"

interface InvoiceDetailsSheetProps {
    invoice: InvoiceInterface
    children?: React.ReactNode
    opened?: boolean
    onOpenChange?: (status: boolean) => void
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

const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    try {
        return format(new Date(date), "d MMM yyyy à HH:mm", {locale: fr})
    } catch {
        return 'N/A'
    }
}

export function InvoiceDetailsSheet({invoice, children, opened, onOpenChange}: InvoiceDetailsSheetProps) {
    if (!invoice) return null

    return (
        <LegacySheet trigger={children} opened={opened} onOpenChange={onOpenChange}>
            <div className="flex flex-col h-full space-y-6 p-6">
                <div className="flex flex-row items-center space-x-4 pt-4">
                    <div className="flex items-center justify-center size-16 rounded-full bg-primary/10">
                        <FileTextIcon className="size-8 text-primary"/>
                    </div>
                    <div className="flex flex-col items-start space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">Facture {invoice.invoiceNumber}</h2>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                            {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                        </Badge>
                    </div>
                </div>

                <Separator/>

                <div className="flex-1 space-y-6">
                    <Section title="Montants">
                        <InfoRow icon={<CreditCardIcon className="size-4"/>} label="Montant" value={`${invoice.amount.toLocaleString('fr-FR')} FCFA`}/>
                        {invoice.transactionFee != null && invoice.transactionFee > 0 && (
                            <InfoRow icon={<CreditCardIcon className="size-4"/>} label="Frais" value={`${invoice.transactionFee.toLocaleString('fr-FR')} FCFA`}/>
                        )}
                        <InfoRow
                            icon={<CreditCardIcon className="size-4"/>}
                            label="Net"
                            value={`${((invoice.amount) - (invoice.transactionFee ?? 0)).toLocaleString('fr-FR')} FCFA`}
                        />
                    </Section>

                    <Section title="Dates">
                        <InfoRow icon={<CalendarIcon className="size-4"/>} label="Créée le" value={formatDate(invoice.createdAt)}/>
                        {invoice.dueDate && (
                            <InfoRow icon={<CalendarIcon className="size-4"/>} label="Échéance" value={formatDate(invoice.dueDate)}/>
                        )}
                        {invoice.paidAt && (
                            <InfoRow icon={<CalendarIcon className="size-4"/>} label="Payée le" value={formatDate(invoice.paidAt)}/>
                        )}
                    </Section>

                    {invoice.paymentMethod && (
                        <Section title="Moyen de paiement">
                            <InfoRow
                                icon={<CreditCardIcon className="size-4"/>}
                                label="Méthode"
                                value={invoice.paymentMethod.name}
                            />
                        </Section>
                    )}

                    {invoice.order && (
                        <Section title="Commande liée">
                            <InfoRow
                                icon={<FileTextIcon className="size-4"/>}
                                label="N° Commande"
                                value={invoice.order.orderNumber}
                            />
                        </Section>
                    )}
                </div>
            </div>
        </LegacySheet>
    )
}

function Section({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    )
}

function InfoRow({icon, label, value}: { icon: React.ReactNode; label: string; value?: string }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <span className="text-sm font-medium">{value || '—'}</span>
        </div>
    )
}
