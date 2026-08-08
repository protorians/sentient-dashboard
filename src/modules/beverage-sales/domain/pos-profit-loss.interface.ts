export interface PosProfitBreakdown {
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
}

export interface PosProfitProduct {
    productId: string;
    productName: string;
    sku: string;
    revenue: number;
    expenses: number;
    profit: number;
    quantity: number;
}

export interface PosProfitLossInterface {
    period: string;
    periodStart: string;
    periodEnd: string;
    summary: {
        revenue: number;
        expenses: number;
        profit: number;
        orderCount: number;
    };
    breakdown: PosProfitBreakdown[];
    topProducts: PosProfitProduct[];
}
