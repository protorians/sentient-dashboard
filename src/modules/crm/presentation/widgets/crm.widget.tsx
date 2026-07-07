import * as React from "react"
import {ContactIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface CrmWidgetProps {
    data?: {
        totalClients?: number
        activeDeals?: number
        clientGrowth?: number
    }
    loading?: boolean
}

export function CrmWidget({ data, loading }: CrmWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <ContactIcon className="size-5 text-primary" />
                    <span>CRM</span>
                </div>
            }
            description="Relations clients et prospects"
            stats={[
                { label: 'Clients', amount: data?.totalClients ?? 0, trend: data?.clientGrowth ?? 0 },
                { label: 'Opportunités', amount: data?.activeDeals ?? 0 }
            ]}
            className="h-full"
        />
    )
}
