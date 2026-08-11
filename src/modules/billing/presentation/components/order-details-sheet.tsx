"use client"

import React from "react"
import {LegacySheet} from "@/core/presentation/sheets/legacy-sheet"
import {Badge} from "@/core/presentation/ui/badge"
import {Separator} from "@/core/presentation/ui/separator"
import {OrderInterface} from "@/modules/billing/domain/order.interface"
import {ORDER_STATUS_LABELS} from "@/modules/billing/domain/enums/order-status.enum"
import {OrderStatusEnum} from "@/modules/billing/domain/enums/order-status.enum"
import {format} from "date-fns"
import {fr} from "date-fns/locale"
import {PackageIcon, CalendarIcon, CreditCardIcon} from "lucide-react"

interface OrderDetailsSheetProps {
    order: OrderInterface
    children?: React.ReactNode
    opened?: boolean
    onOpenChange?: (status: boolean) => void
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

const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    try {
        return format(new Date(date), "d MMM yyyy à HH:mm", {locale: fr})
    } catch {
        return 'N/A'
    }
}

export function OrderDetailsSheet({order, children, opened, onOpenChange}: OrderDetailsSheetProps) {
    if (!order) return null

    return (
        <LegacySheet trigger={children} opened={opened} onOpenChange={onOpenChange}>
            <div className="flex flex-col h-full space-y-6 p-6">
                <div className="flex flex-row items-center space-x-4 pt-4">
                    <div className="flex items-center justify-center size-16 rounded-full bg-primary/10">
                        <PackageIcon className="size-8 text-primary"/>
                    </div>
                    <div className="flex flex-col items-start space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">Commande {order.orderNumber}</h2>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                    </div>
                </div>

                <Separator/>

                <div className="flex-1 space-y-6">
                    <Section title="Informations générales">
                        <InfoRow icon={<CalendarIcon className="size-4"/>} label="Créée le" value={formatDate(order.createdAt)}/>
                        <InfoRow icon={<CreditCardIcon className="size-4"/>} label="Montant total" value={`${order.totalAmount.toLocaleString('fr-FR')} FCFA`}/>
                    </Section>

                    {order.paymentMethod && (
                        <Section title="Moyen de paiement">
                            <InfoRow
                                icon={<CreditCardIcon className="size-4"/>}
                                label="Méthode"
                                value={order.paymentMethod.name}
                            />
                        </Section>
                    )}

                    {order.items && order.items.length > 0 && (
                        <Section title={`Articles (${order.items.length})`}>
                            <div className="flex flex-col gap-2">
                                {order.items.map((item, index) => (
                                    <div key={item.id ?? index} className="flex justify-between items-center p-3 border rounded-lg bg-muted/20">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.description}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                        <span className="font-semibold">
                                            {item.totalPrice.toLocaleString('fr-FR')} FCFA
                                        </span>
                                    </div>
                                ))}
                            </div>
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
