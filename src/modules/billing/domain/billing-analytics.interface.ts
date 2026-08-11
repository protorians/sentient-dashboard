export interface BillingAnalyticsSummaryInterface {
    totalInvoiced: number;
    pendingPayments: number;
    totalOrders: number;
    revenueTrend: number;
    collectedAmount: number;
    overdueCount: number;
}

export interface BillingAnalyticsChartSeriesInterface {
    date: string;
    amount: number;
}

export interface BillingAnalyticsChartsInterface {
    revenue: BillingAnalyticsChartSeriesInterface[];
    invoices: BillingAnalyticsChartSeriesInterface[];
    collections: BillingAnalyticsChartSeriesInterface[];
}

export interface BillingAnalyticsInterface {
    summary: BillingAnalyticsSummaryInterface;
    charts: BillingAnalyticsChartsInterface;
}
