import * as React from "react"
import {UsersIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface UsersAnalyticsWidgetProps {
    data?: {
        totalUsers?: number
        activeUsers?: number
        growth?: number
    }
    loading?: boolean
}

export function UsersAnalyticsWidget({ data, loading }: UsersAnalyticsWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <UsersIcon className="size-5 text-primary" />
                    <span>Utilisateurs</span>
                </div>
            }
            description="Gestion des comptes et activités"
            stats={[
                { label: 'Total', amount: data?.totalUsers ?? 0, trend: data?.growth ?? 0 },
                { label: 'Actifs', amount: data?.activeUsers ?? 0 }
            ]}
            className="h-full"
        />
    )
}