"use client"

import * as React from "react"
import {AppSidebar} from "@/core/presentation/app-sidebar"
import {DashboardHeader} from "../components/dashboard-header"
import {SidebarInset, SidebarProvider} from "@/core/presentation/ui/sidebar"

import {UsersService} from "@/modules/users/application/service/users.service"
import {UserAnalyticsAdapter} from "@/modules/users/infrastructure/adapters/user-analytics.adapter"
import {ProjectManagementService} from "@/modules/project-management/application/service/project-management.service"
import {CrmService} from "@/modules/crm/application/service/crm.service"
import {StockService} from "@/modules/stock/application/service/stock.service"
import {BloggingService} from "@/modules/blogging/application/service/blogging.service"
import {RestaurantService} from "@/modules/restaurant/application/service/restaurant.service"
import {BillingService} from "@/modules/billing/application/service/billing.service"
import {AccessControlService} from "@/modules/access-control/application/service/access-control.service"
import {NotificationsService} from "@/modules/notifications/application/service/notifications.service"

import {useModuleStore} from "@/core/infrastructure/stores/module.store"

export function DashboardView() {
    const { modules } = useModuleStore()
    const [analytics, setAnalytics] = React.useState<Record<string, any>>({})
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const loadAllAnalytics = async () => {
            setLoading(true)
            const results: Record<string, any> = {}

            const analyticsConfig = [
                { id: 'users', service: UsersService, method: 'getAnalytics', adapter: UserAnalyticsAdapter.toDashboard },
                { id: 'project-management', service: ProjectManagementService, method: 'getGlobalAnalytics' },
                { id: 'crm', service: CrmService, method: 'getAnalytics' },
                { id: 'stock', service: StockService, method: 'getAnalytics' },
                { id: 'blog', service: BloggingService, method: 'getAnalytics' },
                { id: 'restaurant', service: RestaurantService, method: 'getAnalytics' },
                { id: 'billing', service: BillingService, method: 'getAnalytics' },
                { id: 'access-control', service: AccessControlService, method: 'getSummary' },
                { id: 'notifications', service: NotificationsService, method: 'getAnalytics' },
            ]

            await Promise.allSettled(
                analyticsConfig.map(async (conf) => {
                    try {
                        const res = await (conf.service as any)[conf.method]()
                        const data = res.data?.data || res.data
                        results[conf.id] = (conf as any).adapter ? (conf as any).adapter(data) : data
                    } catch (error) {
                        console.error(`Erreur chargement analytics pour ${conf.id}:`, error)
                    }
                })
            )

            setAnalytics(results)
            setLoading(false)
        }

        loadAllAnalytics()
    }, [])

    const activeModulesWithWidgets = modules.filter(m => m.isEnabled && m.widgets?.analytics)

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset"/>
            <SidebarInset>
                <DashboardHeader/>
                <div className="flex flex-1 flex-col p-4 lg:p-6">
                    <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {activeModulesWithWidgets.map((module) => {
                                const Widget = module.widgets!.analytics as React.ComponentType<any>
                                return (
                                    <Widget
                                        key={module.id}
                                        data={analytics[module.id]}
                                        loading={loading}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
