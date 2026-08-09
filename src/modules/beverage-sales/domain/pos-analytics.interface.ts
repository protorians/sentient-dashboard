export interface PosAnalyticsProduct {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    revenue: number;
}

export interface PosAnalyticsTableInfo {
    tableId: string | null;
    tableLabel: string | null;
    products: PosAnalyticsProduct[];
    orderCount: number;
    totalRevenue: number;
}

export interface PosAnalyticsTimeSeriesPoint {
    date: string;
    value: number;
}

export interface PosAnalyticsOrderStatusCount {
    status: string;
    count: number;
}

export interface PosAnalyticsInterface {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        totalItems: number;
        averageOrderValue: number;
    };
    ordersByStatus: PosAnalyticsOrderStatusCount[];
    productsByTable: PosAnalyticsTableInfo[];
    topProducts: PosAnalyticsProduct[];
    revenueOverTime: PosAnalyticsTimeSeriesPoint[];
    ordersOverTime: PosAnalyticsTimeSeriesPoint[];
}
