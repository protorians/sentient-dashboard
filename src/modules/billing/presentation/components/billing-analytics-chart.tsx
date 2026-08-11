"use client"

import {Fragment, useEffect, useState} from "react"
import {billingAnalyticsRoutine} from "@/modules/billing/infrastructure/routines/billing-analytics.routine"
import {AreaWidgetChart} from "@/core/presentation/charts/area-widget.chart"
import {AreaWidgetChartSkeleton} from "@/core/presentation/charts/area-widget.chart-skeleton"
import {ChartConfig} from "@/core/presentation/ui/chart"

const chartConfig = {
    revenue: {label: 'Revenus', color: 'var(--color-chart-1)'},
    invoices: {label: 'Factures', color: 'var(--color-chart-2)'},
    collections: {label: 'Encaissements', color: 'var(--color-chart-3)'},
} satisfies ChartConfig

export function BillingAnalyticsChart() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {dataset: analytics} = billingAnalyticsRoutine.dataset()

    useEffect(() => {
        if (analytics && analytics.summary) setIsLoading(false)
    }, [analytics])

    if (isLoading) {
        return (
            <div className="h-[40dvh]">
                <AreaWidgetChartSkeleton
                    title="Évolution de la facturation"
                    description="Revenus, factures et encaissements par période"
                    className="h-full"
                />
            </div>
        )
    }

    const charts = analytics?.charts
    const chartData = (charts?.revenue || []).map((entry, index) => ({
        date: entry.date,
        revenue: entry.amount,
        invoices: charts.invoices?.[index]?.amount ?? 0,
        collections: charts.collections?.[index]?.amount ?? 0,
    }))

    if (chartData.length === 0) {
        return (
            <div className="h-[40dvh] flex items-center justify-center">
                <p className="text-muted-foreground">Aucune donnée disponible pour la période.</p>
            </div>
        )
    }

    return (
        <div className="w-full h-[40dvh]">
            <AreaWidgetChart
                title="Évolution de la facturation"
                description="Revenus, factures et encaissements par période"
                data={chartData}
                config={chartConfig}
                areas={[
                    {dataKey: 'revenue'},
                    {dataKey: 'invoices'},
                    {dataKey: 'collections'},
                ]}
                xAxisDataKey="date"
                className="h-full"
            />
        </div>
    )
}
