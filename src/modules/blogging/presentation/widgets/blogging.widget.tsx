import * as React from "react"
import {FileTextIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface BloggingWidgetProps {
    data?: {
        totalPosts?: number
        totalViews?: number
        viewsTrend?: number
    }
    loading?: boolean
}

export function BloggingWidget({ data, loading }: BloggingWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <FileTextIcon className="size-5 text-primary" />
                    <span>Blogging</span>
                </div>
            }
            description="Contenu et engagement"
            stats={[
                { label: 'Articles', amount: data?.totalPosts ?? 0 },
                { label: 'Vues', amount: data?.totalViews ?? 0, trend: data?.viewsTrend ?? 0 }
            ]}
            className="h-full"
        />
    )
}
