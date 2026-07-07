import * as React from "react"
import {BuildingIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface OrganizationsWidgetProps {
    data?: {
        totalOrganizations?: number
        activeOrganizations?: number
    }
    loading?: boolean
}

export function OrganizationsWidget({ data, loading }: OrganizationsWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <BuildingIcon className="size-5 text-primary" />
                    <span>Organisations</span>
                </div>
            }
            description="Gestion des organisations"
            stats={[
                { label: 'Total', amount: data?.totalOrganizations ?? 0 },
                { label: 'Actives', amount: data?.activeOrganizations ?? 0 }
            ]}
            className="h-full"
        />
    )
}
