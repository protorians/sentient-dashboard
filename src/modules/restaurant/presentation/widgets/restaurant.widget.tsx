import * as React from "react"
import {UtensilsIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface RestaurantWidgetProps {
    data?: {
        todayOrders?: number
        todayRevenue?: number
        ordersTrend?: number
    }
    loading?: boolean
}

export function RestaurantWidget({ data, loading }: RestaurantWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <UtensilsIcon className="size-5 text-primary" />
                    <span>Restaurant</span>
                </div>
            }
            description="Commandes et réservations"
            stats={[
                { label: 'Commandes', amount: data?.todayOrders ?? 0, trend: data?.ordersTrend ?? 0 },
                { label: 'Revenus', amount: data?.todayRevenue ?? 0, devise: 'XOF' }
            ]}
            className="h-full"
        />
    )
}
