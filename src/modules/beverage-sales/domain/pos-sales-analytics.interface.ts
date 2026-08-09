import {PosAnalyticsTimeSeriesPoint} from "@/modules/beverage-sales/domain/pos-analytics.interface";

export interface PosSalesByProduct {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    revenue: number;
    orderCount: number;
    remainingStock: number;
}

export interface PosTopCustomer {
    customerId: string | null;
    customerName: string | null;
    orderCount: number;
    totalRevenue: number;
}

export interface PosChartItem {
    label: string;
    value: number;
}

export interface PosSalesByDayPart {
    dayPart: 'matin' | 'pause' | 'après-midi' | 'hors-horaires' | 'fermé';
    label: string;
    revenue: number;
    orderCount: number;
}

export interface PosSalesAnalyticsInterface {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        totalItems: number;
        averageOrderValue: number;
    };
    salesByProduct: PosSalesByProduct[];
    productsChart: PosChartItem[];
    topCustomers: PosTopCustomer[];
    revenueOverTime: PosAnalyticsTimeSeriesPoint[];
    ordersOverTime: PosAnalyticsTimeSeriesPoint[];
    salesByDayPart: PosSalesByDayPart[];
}
