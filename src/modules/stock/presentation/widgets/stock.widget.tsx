"use client"
import * as React from "react"
import {PackageIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"
import {stockAnalyticsRoutine} from "@/modules/stock/infrastructure/routines/stock-analytics.routine"

export interface StockWidgetProps {
    data?: {
        totalProducts?: number
        lowStockCount?: number
        outOfStockCount?: number
        totalMovements?: number
    }
    loading?: boolean
}

export function StockWidget({ data, loading }: StockWidgetProps) {
    const {dataset: analytics} = stockAnalyticsRoutine.dataset()
    const summary = analytics?.summary

    const totalProducts = data?.totalProducts ?? summary?.totalProducts ?? 0
    const lowStockCount = data?.lowStockCount ?? summary?.lowStockCount ?? 0
    const outOfStockCount = data?.outOfStockCount ?? summary?.outOfStockCount ?? 0
    const totalMovements = data?.totalMovements ?? summary?.totalMovements ?? 0

    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <PackageIcon className="size-5 text-primary" />
                    <span>Stock</span>
                </div>
            }
            description="Inventaire et logistique"
            stats={[
                { label: 'Produits', amount: totalProducts },
                { label: 'Alertes', amount: lowStockCount },
                { label: 'Ruptures', amount: outOfStockCount },
                { label: 'Mouvements', amount: totalMovements }
            ]}
            className="h-full"
        />
    )
}
