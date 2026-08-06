import {StockAnalyticsInterface} from "@/modules/stock/domain/stock-analytics.interface";

export class StockAnalyticsAdapter {
    static toDashboard(data: StockAnalyticsInterface | undefined) {
        const summary = data?.summary;
        if (!summary) {
            return {
                totalProducts: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                totalMovements: 0
            };
        }
        return {
            totalProducts: summary.totalProducts || 0,
            lowStockCount: summary.lowStockCount || 0,
            outOfStockCount: summary.outOfStockCount || 0,
            totalMovements: summary.totalMovements || 0
        };
    }
}
