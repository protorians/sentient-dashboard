import * as React from "react"
import {BellIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface NotificationsWidgetProps {
    data?: {
        sentToday?: number
        failedToday?: number
        failureTrend?: number
    }
    loading?: boolean
}

export function NotificationsWidget({ data, loading }: NotificationsWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <BellIcon className="size-5 text-primary" />
                    <span>Notifications</span>
                </div>
            }
            description="Alertes et communications"
            stats={[
                { label: 'Envoyées', amount: data?.sentToday ?? 0 },
                { label: 'Echecs', amount: data?.failedToday ?? 0, trend: data?.failureTrend ?? 0 }
            ]}
            className="h-full"
        />
    )
}
