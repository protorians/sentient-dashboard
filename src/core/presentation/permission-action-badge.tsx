import {explainActivityAction} from "@/core/infrastructure/utilities/activities.util";
import {cn} from "@/core/infrastructure/utilities/utils";


export interface PermissionActionBadgeProps {
    action?: string
}


export function PermissionActionBadge({action}: PermissionActionBadgeProps) {
    if(!action) return;

    let className = ''
    switch (action?.toLowerCase()) {
        case 'get':
            className = 'bg-blue-500/10 text-blue-500 border-blue-500/30'
            break
        case 'post':
            className = 'bg-green-500/10 text-green-500 border-green-500/30'
            break
        case 'put':
        case 'patch':
            className = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
            break
        case 'delete':
            className = 'bg-red-500/10 text-red-500 border-red-500/30'
            break
    }

    return (
        <div className={cn('text-xs px-2.5 py-1 border rounded-full', className)}>
            {explainActivityAction(action)}
        </div>
    )
}
