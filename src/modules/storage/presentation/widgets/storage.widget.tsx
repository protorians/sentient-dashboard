import * as React from "react"
import {DatabaseIcon} from "lucide-react"
import {ModuleWidget} from "@/core/presentation/module-widget"

export interface StorageWidgetProps {
    data?: {
        totalFiles?: number
        totalSize?: string
    }
    loading?: boolean
}

export function StorageWidget({ data, loading }: StorageWidgetProps) {
    return (
        <ModuleWidget
            title={
                <div className="flex items-center gap-2">
                    <DatabaseIcon className="size-5 text-primary" />
                    <span>Stockage</span>
                </div>
            }
            description="Gestion des fichiers"
            stats={[
                { label: 'Fichiers', amount: data?.totalFiles ?? 0 },
                { label: 'Utilisé', amount: 0, description: data?.totalSize ?? '0 B' }
            ]}
            className="h-full"
        />
    )
}
