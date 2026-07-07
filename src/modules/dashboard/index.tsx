import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";

const dashboardModule: ModuleDeclarationInterface = {
    id: 'dashboard',
    key: 'DASHBOARD',
    name: 'Dashboard',
    description: 'Tableau de bord principal',
    icon: "LayoutDashboardIcon",
    logo: undefined,
    url: '/dashboard',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default dashboardModule
