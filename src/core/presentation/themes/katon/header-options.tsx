import {HeaderTasksConnectedUser} from "@/core/presentation/themes/katon/header-tasks-connected-user";
import {NotificationsPopover} from "@/modules/notifications/presentation/components/notifications-popover";

export function HeaderOptions() {
    return (
        <div className="flex flex-row items-center justify-center gap-1">
            <NotificationsPopover/>
            <HeaderTasksConnectedUser/>
        </div>
    )
}
