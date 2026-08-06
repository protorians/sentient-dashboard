import {PosApiService} from "@/modules/pos-management/application/service/pos-api-service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import PosView from "@/modules/pos-management/presentation/views/pos.view";

const posModule: ModuleDeclarationInterface = {
    id: 'pos-management',
    key: 'POS_MANAGEMENT',
    name: 'Ventes & Commandes',
    description: 'Gestion des ventes (gros/semi-gros/détail) et des commandes',
    icon: "ShoppingCartIcon",
    logo: undefined,
    widgets: {
        // analytics: PosWidget // Si nécessaire plus tard
    },
    service: {
        fetch: PosApiService
    },
    routines: [],
    uri: '/pos-management',
    isEnabled: true,
    isDefault: false,
    type: 'INTERNAL',
}

export default posModule
