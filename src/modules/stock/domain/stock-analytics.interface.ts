export interface StockAnalyticsSummaryInterface {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalMovements: number;
}

export interface StockAnalyticsStockLevelInterface {
    productId: string;
    productName: string;
    sku?: string | null;
    quantity: number;
    status: 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';
}

export interface StockAnalyticsMovementsByTypeInterface {
    type: string;
    count: number;
    quantity: number;
}

export interface StockAnalyticsRecentMovementInterface {
    id: string;
    productName: string;
    type: string;
    quantity: number;
    createdAt: string;
}

export interface StockAnalyticsChartSeriesInterface {
    date: string;
    count: number;
}

export interface StockAnalyticsChartsInterface {
    entries: StockAnalyticsChartSeriesInterface[];
    exits: StockAnalyticsChartSeriesInterface[];
    ruptures: StockAnalyticsChartSeriesInterface[];
    stockLevel: StockAnalyticsChartSeriesInterface[];
}

export interface StockAnalyticsInterface {
    summary: StockAnalyticsSummaryInterface;
    stockLevels: StockAnalyticsStockLevelInterface[];
    movementsByType: StockAnalyticsMovementsByTypeInterface[];
    recentMovements: StockAnalyticsRecentMovementInterface[];
    charts: StockAnalyticsChartsInterface;
}
