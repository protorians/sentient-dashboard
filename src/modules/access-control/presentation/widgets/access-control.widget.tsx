import * as React from "react"
import {ShieldIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface AccessControlWidgetProps {
    data?: {
        totalRoles?: number
        criticalAlerts?: number
        alertsTrend?: number
    }
    loading?: boolean
}

export function AccessControlWidget({ data, loading }: AccessControlWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <ShieldIcon className="size-5 text-primary" />
                    <span>Sécurité</span>
                </div>
            }
            description="Rôles et permissions"
            stats={[
                { label: 'Rôles', amount: data?.totalRoles ?? 0 },
                { label: 'Audit', amount: data?.criticalAlerts ?? 0, trend: data?.alertsTrend ?? 0 }
            ]}
            className="h-full"
        />
    )
}
