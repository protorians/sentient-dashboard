"use client"

import * as React from "react"
import {useQuery} from "@tanstack/react-query"
import {WineIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service"
import {PosAnalyticsInterface} from "@/modules/beverage-sales/domain/pos-analytics.interface"

export interface BeverageSalesWidgetProps {
    data?: {
        todayOrders?: number
        todayRevenue?: number
        ordersTrend?: number
    }
    loading?: boolean
}

export function BeverageSalesWidget({ data, loading }: BeverageSalesWidgetProps) {
    const today = new Date().toISOString().split('T')[0]

    const {data: analytics} = useQuery<PosAnalyticsInterface>({
        queryKey: ['beverage-sales', 'analytics', today],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getAnalytics({startDate: today, granularity: 'day'});
            return response.data?.data!;
        },
        enabled: !data,
    });

    const totalRevenue = analytics?.summary.totalRevenue ?? 0
    const todayRevenue = analytics?.summary.totalRevenue ?? 0
    const todayOrders = analytics?.summary.totalOrders ?? 0
    const ordersTrend = totalRevenue > 0 ? Math.round((todayRevenue / totalRevenue) * 100) : 0

    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <WineIcon className="size-5 text-primary" />
                    <span>Vente de Boissons</span>
                </div>
            }
            description="Caisse du dépôt (gros, semi-gros, détail)"
            stats={[
                { label: 'Commandes du jour', amount: data?.todayOrders ?? todayOrders, trend: data?.ordersTrend ?? ordersTrend },
                { label: 'Revenus du jour', amount: data?.todayRevenue ?? todayRevenue, devise: 'XOF' },
                { label: 'Revenus totaux', amount: totalRevenue, devise: 'XOF' },
            ]}
            loading={loading}
            className="h-full"
        />
    )
}
