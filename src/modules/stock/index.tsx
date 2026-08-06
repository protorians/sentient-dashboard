import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {StockWidget} from "@/modules/stock/presentation/widgets/stock.widget";
import {stockAnalyticsRoutine} from "@/modules/stock/infrastructure/routines/stock-analytics.routine";

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
    routines: [
        stockAnalyticsRoutine
    ],
    uri: '/stock-management',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default stockModule
