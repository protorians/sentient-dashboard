export interface PosAnalyticsProduct {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    revenue: number;
}

export interface PosAnalyticsTableInfo {
    tableLabel: string;
    products: PosAnalyticsProduct[];
    orderCount: number;
    totalRevenue: number;
}

export interface PosAnalyticsTimeSeriesPoint {
    date: string;
    value: number;
}

export interface PosAnalyticsInterface {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        totalQuantity: number;
        averageBasket: number;
    };
    ordersByStatus: Record<string, number>;
    productsByTable: PosAnalyticsTableInfo[];
    topProducts: PosAnalyticsProduct[];
    revenueOverTime: PosAnalyticsTimeSeriesPoint[];
    ordersOverTime: PosAnalyticsTimeSeriesPoint[];
}
