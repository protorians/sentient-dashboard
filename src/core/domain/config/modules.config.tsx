import {ComponentIcon, HomeIcon, ShieldIcon, UsersIcon} from "lucide-react";
import {ModuleNavigationInterface} from "@/core/domain/entities/module.interface";
import {ModulesListSheet} from "@/core/presentation/modules-list-sheet";
import dashboardModule from "@/modules/dashboard";
import usersModule from "@/modules/users";
import stockModule from "@/modules/stock";
import posModule from "@/modules/pos-management";
import accessControlModule from "@/modules/access-control";


export const defaultModulesNavConfig: ModuleNavigationInterface[] = [
    {
        id: dashboardModule.id,
        label: 'Tableau de bord',
        icon: "LayoutDashboardIcon",
        url: '/dashboard',
        useOnlyIcon: true,
    },
    {
        id: usersModule.id,
        label: 'Utilisateurs',
        icon: "UsersIcon",
        useOnlyIcon: false,
        url: '/users',
    },
    {
        id: stockModule.id,
        label: 'Stock',
        icon: "PackageIcon",
        useOnlyIcon: false,
        url: '/stock-management',
    },
    {
        id: posModule.id,
        label: 'Ventes',
        icon: "ShoppingCartIcon",
        useOnlyIcon: false,
        url: '/pos-management',
    },
    {
        id: accessControlModule.id,
        label: 'Contrôles d\'accès',
        icon: "ShieldIcon",
        useOnlyIcon: false,
        url: '/access-control',
    },
    {
        id: 'module-management',
        label: 'Modules',
        icon: "LayoutGrid",
        useOnlyIcon: false,
        url: '/modules',
        dropdown: {
            type: 'mini',
            component: ModulesListSheet
        }
    },
]