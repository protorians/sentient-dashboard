import {ComponentIcon, HomeIcon, ShieldIcon, UsersIcon} from "lucide-react";
import {ModuleNavigationInterface} from "@/core/domain/entities/module.interface";
import {ModulesListSheet} from "@/core/presentation/modules-list-sheet";


export const defaultModulesNavConfig: ModuleNavigationInterface[] = [
    {
        label: 'Tableau de bord',
        icon: "LayoutDashboardIcon",
        url: '/dashboard',
        useOnlyIcon: true,
    },
    {
        label: 'Utilisateurs',
        icon: "UsersIcon",
        useOnlyIcon: false,
        url: '/users',
    },
    {
        label: 'Contrôles d\'accès',
        icon: "ShieldIcon",
        useOnlyIcon: false,
        url: '/access-control',
    },
    {
        label: 'Modules',
        icon: "ComponentIcon",
        useOnlyIcon: false,
        url: '/modules',
        dropdown: {
            type: 'mega',
            component: ModulesListSheet
        }
    },
]