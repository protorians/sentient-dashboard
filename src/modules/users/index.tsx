import {UsersAnalyticsWidget} from "@/modules/users/presentation/widgets/users-analytics.widget";
import {UsersApiService} from "@/modules/users/application/service/users-api-service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {
    usersAnalyticsRoutine,
} from "@/modules/users/infrastructure/routines/users-analytics.routine";

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
    routines: [
        usersAnalyticsRoutine
    ],
    uri: '/users',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
    menu: {
        items: [
            {
                label: 'Fichier',
                // description: 'Gestion des comptes et activités',
                icon: "UsersIcon",
                // action: () => {},
                items: [
                    {
                        label: 'Créer',
                        description: 'Créer un nouvel utilisateur',
                        icon: "PlusIcon",
                        action: () => {
                        }
                    },
                    {
                        label: "Voir",
                        description: 'Voir un utilisateur',
                        icon: "EyeIcon"
                    },
                    {
                        separator: true
                    },
                    {
                        label: 'Exporter',
                        description: 'Exporter des utilisateurs',
                        icon: "DownloadIcon"
                    }
                ]
            },
            {
                label: 'Organisations',
                // description: 'Gestion des comptes et activités',
                icon: "BuildingIcon",
                // action: () => {},
                items: [
                    {
                        label: 'Créer',
                        description: 'Créer une nouvelle organisation',
                        icon: "PlusIcon",
                        action: () => {
                        }
                    },
                    {
                        label: "Voir",
                        description: 'Voir une organisation',
                        icon: "EyeIcon"
                    },
                ]
            }
        ]
    }
}

export default usersModule