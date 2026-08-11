"use client"
import * as React from "react"
import {CreditCardIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"
import {billingAnalyticsRoutine} from "@/modules/billing/infrastructure/routines/billing-analytics.routine"

export interface BillingWidgetProps {
    data?: {
        totalInvoiced?: number
        pendingPayments?: number
        revenueTrend?: number
    }
    loading?: boolean
}

export function BillingWidget({ data, loading }: BillingWidgetProps) {
    const {dataset: analytics} = billingAnalyticsRoutine.dataset()
    const summary = analytics?.summary

    const totalInvoiced = data?.totalInvoiced ?? summary?.totalInvoiced ?? 0
    const pendingPayments = data?.pendingPayments ?? summary?.pendingPayments ?? 0
    const revenueTrend = data?.revenueTrend ?? summary?.revenueTrend ?? 0

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
                { label: 'Facturé', amount: totalInvoiced, devise: 'XOF', trend: revenueTrend },
                { label: 'En attente', amount: pendingPayments }
            ]}
            className="h-full"
        />
    )
}
