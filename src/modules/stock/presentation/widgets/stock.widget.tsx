import * as React from "react"
import {PackageIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface StockWidgetProps {
    data?: {
        totalItems?: number
        lowStockCount?: number
        alertsTrend?: number
    }
    loading?: boolean
}

export function StockWidget({ data, loading }: StockWidgetProps) {
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
                { label: 'Produits', amount: data?.totalItems ?? 0 },
                { label: 'Alertes', amount: data?.lowStockCount ?? 0, trend: data?.alertsTrend ?? 0 }
            ]}
            className="h-full"
        />
    )
}
