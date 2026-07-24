import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {StockWidget} from "@/modules/stock/presentation/widgets/stock.widget";

const stockModule: ModuleDeclarationInterface = {
    id: 'stock',
    key: 'STOCK',
    name: 'Stock',
    description: 'Gestion des stocks',
    icon: "PackageIcon",
    logo: undefined,
    widgets: {
        analytics: StockWidget
    },
    service: {
        fetch: StockApiService
    },
    url: '/stock-management',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default stockModule
