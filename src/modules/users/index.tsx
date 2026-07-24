import {UsersAnalyticsWidget} from "@/modules/users/presentation/widgets/users-analytics.widget";
import {UsersApiService} from "@/modules/users/application/service/users-api-service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";

const usersModule: ModuleDeclarationInterface = {
    id: 'users',
    key: 'USERS',
    name: 'Utilisateurs',
    description: 'Gestion des comptes et activités',
    icon: "UsersIcon",
    logo: undefined,
    widgets: {
        analytics: UsersAnalyticsWidget
    },
    service: {
        fetch: UsersApiService
    },
    url: '/users',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default usersModule