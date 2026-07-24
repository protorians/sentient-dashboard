import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {UsersApiService} from "@/modules/users/application/service/users-api-service";

const usersActivitiesModule: ModuleDeclarationInterface = {
    id: 'users-activities',
    key: 'USER_ACTIVITIES',
    name: 'Activités des utilisateurs',
    description: 'Gestion des activités des utilisateurs',
    icon: "TimelineIcon",
    logo: undefined,
    widgets: {},
    service: {
        fetch: UsersApiService
    },
    url: '/users-activities',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default usersActivitiesModule