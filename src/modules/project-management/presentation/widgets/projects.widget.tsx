import * as React from "react"
import {BriefcaseIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface ProjectsWidgetProps {
    data?: {
        activeProjects?: number
        totalTasks?: number
        trend?: number
    }
    loading?: boolean
}

export function ProjectsWidget({ data, loading }: ProjectsWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <BriefcaseIcon className="size-5 text-primary" />
                    <span>Projets</span>
                </div>
            }
            description="Suivi des tâches et avancement"
            stats={[
                { label: 'En cours', amount: data?.activeProjects ?? 0, trend: data?.trend ?? 0 },
                { label: 'Tâches', amount: data?.totalTasks ?? 0 }
            ]}
            className="h-full"
        />
    )
}
