import {explainActivityAction} from "@/core/infrastructure/utilities/activities.util";
import {cn} from "@/core/infrastructure/utilities/utils";


export function ActivityActionBadge({action}: { action?: string }) {
    if(!action) return;

    let className = ''
    switch (action?.toLowerCase()) {
        case 'get':
            className = 'bg-blue-500/20 text-foreground'
            break
        case 'post':
            className = 'bg-green-500/20 text-foreground'
            break
        case 'put':
        case 'patch':
            className = 'bg-yellow-500/20 text-foreground'
            break
        case 'delete':
            className = 'bg-red-500/20 text-foreground'
            break
    }

    return (
        <div className={cn(className, 'text-xs px-2.5 py-1 rounded-full')}>
            {explainActivityAction(action)}
        </div>
    )
}
