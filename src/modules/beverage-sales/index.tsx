import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {BeverageSalesWidget} from "@/modules/beverage-sales/presentation/widgets/beverage-sales.widget";

const beverageSalesModule: ModuleDeclarationInterface = {
    id: 'beverage-sales',
    key: 'BEVERAGE_SALES',
    name: 'Vente de Boissons',
    description: 'Vente de boissons depuis le dépôt (gros, semi-gros, détail) et gestion des bundles',
    icon: "WineIcon",
    logo: undefined,
    widgets: {
        analytics: BeverageSalesWidget
    },
    service: {
        fetch: BeverageSalesApiService
    },
    routines: [],
    uri: '/beverage-sales',
    isEnabled: true,
    isDefault: false,
    type: 'INTERNAL',
}

export default beverageSalesModule
