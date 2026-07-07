import * as React from "react"
import {CreditCardIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface BillingWidgetProps {
    data?: {
        totalInvoiced?: number
        pendingPayments?: number
        revenueTrend?: number
    }
    loading?: boolean
}

export function BillingWidget({ data, loading }: BillingWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <CreditCardIcon className="size-5 text-primary" />
                    <span>Facturation</span>
                </div>
            }
            description="Finances et paiements"
            stats={[
                { label: 'Facturé', amount: data?.totalInvoiced ?? 0, devise: 'XOF', trend: data?.revenueTrend ?? 0 },
                { label: 'En attente', amount: data?.pendingPayments ?? 0 }
            ]}
            className="h-full"
        />
    )
}
