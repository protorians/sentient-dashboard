import {NotificationsService} from "@/modules/notifications/application/service/notifications.service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {NotificationsWidget} from "@/modules/notifications/presentation/widgets/notifications.widget";

const notificationsModule: ModuleDeclarationInterface = {
    id: 'notifications',
    key: 'NOTIFICATIONS',
    name: 'Notifications',
    description: 'Centre de notifications',
    icon: "BellIcon",
    logo: undefined,
    widgets: {
        analytics: NotificationsWidget
    },
    service: {
        fetch: NotificationsService
    },
    url: '/notifications',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default notificationsModule
