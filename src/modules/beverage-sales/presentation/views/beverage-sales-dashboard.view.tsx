"use client"

import React from "react";
import {useQuery} from "@tanstack/react-query";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/core/presentation/ui/tabs";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ResponsiveContainer, Cell} from "recharts";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {PosAnalyticsInterface} from "@/modules/beverage-sales/domain/pos-analytics.interface";
import {PosSalesAnalyticsInterface} from "@/modules/beverage-sales/domain/pos-sales-analytics.interface";
import {PosProfitLossInterface} from "@/modules/beverage-sales/domain/pos-profit-loss.interface";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {
    BanknoteIcon,
    ShoppingCartIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    PackageIcon,
    UsersIcon,
    WineIcon,
    CalendarIcon,
    BarChart3Icon,
    PercentIcon,
    ReceiptTextIcon
} from "lucide-react";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";
import {Button} from "@/core/presentation/ui/button";
import {Badge} from "@/core/presentation/ui/badge";
import {Input} from "@/core/presentation/ui/input";
import {RequireDepotSetup} from "@/modules/beverage-sales/presentation/components/require-depot-setup";
import {TopProductsByProfitTable} from "@/modules/beverage-sales/presentation/components/top-products-by-profit-table";
import {TopProductsTable} from "@/modules/beverage-sales/presentation/components/top-products-table";
import {SalesByProductTable} from "@/modules/beverage-sales/presentation/components/sales-by-product-table";
import {TablePerformanceCard} from "@/modules/beverage-sales/presentation/components/table-performance-card";
import {TopCustomersList} from "@/modules/beverage-sales/presentation/components/top-customers-list";
import {LowStockProductsList} from "@/modules/beverage-sales/presentation/components/low-stock-products-list";
import {SalesByDayPartCard} from "@/modules/beverage-sales/presentation/components/sales-by-day-part-card";

const PERIOD_PRESETS = [
    {label: "Hier", days: 1, endDays: 0, granularity: "yesterday", periodLabel: "Hier"},
    // {label: "Heure", days: 1, granularity: "hour", periodLabel: "24 dernières heures"},
    {label: "Aujourd'hui", days: 0, granularity: "hour", periodLabel: "Aujourd'hui"},
    // {label: "Minute", days: 0, granularity: "minute", periodLabel: "Dernière heure"},
    {label: "7 jours", days: 7, granularity: "day", periodLabel: "7 derniers jours"},
    {label: "30 jours", days: 30, granularity: "day", periodLabel: "30 derniers jours"},
    {label: "90 jours", days: 90, granularity: "week", periodLabel: "90 derniers jours"},
    {label: "Tout", days: -1, granularity: "month", periodLabel: "Tout l'historique"},
    {label: "Personnalisée", days: -2, granularity: "day", periodLabel: "Personnalisée"},
];

const GRANULARITY_LABELS: Record<string, string> = {
    minute: "Minute",
    hour: "Heure",
    day: "Jour",
    week: "Semaine",
    month: "Mois",
    year: "Année",
    yesterday: "Journée d'hier",
};

const CHART_COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
];

function dateDaysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
}

function formatShortDate(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'});
}

export default function BeverageSalesDashboardView() {
    const [activeTab, setActiveTab] = React.useState("overview");
    const [selectedPreset, setSelectedPreset] = React.useState(1);
    const [customStartDate, setCustomStartDate] = React.useState("");
    const [customEndDate, setCustomEndDate] = React.useState("");

    const isCustom = selectedPreset === PERIOD_PRESETS.length - 1;
    const preset = PERIOD_PRESETS[selectedPreset];
    const granularity = preset.granularity;

    const startDate = !isCustom
        ? (preset.days >= 0 ? dateDaysAgo(preset.days) : undefined)
        : (customStartDate || undefined);

    const endDate = isCustom
        ? (customEndDate || undefined)
        : (preset.endDays != null ? dateDaysAgo(preset.endDays) : undefined);

    const queryParams: Record<string, string> = {granularity};
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    const profitLossParams: Record<string, string> = {};
    if (preset.days === -1) {
        profitLossParams.period = "year";
    } else {
        profitLossParams.period = "custom";
        if (startDate) profitLossParams.startDate = startDate;
        if (endDate) profitLossParams.endDate = endDate;
    }

    const {data: analytics, isLoading} = useQuery<PosAnalyticsInterface>({
        queryKey: ['beverage-sales', 'analytics', 'dashboard', startDate, endDate, granularity],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getAnalytics(queryParams);
            return response.data?.data!;
        },
    });

    const {data: salesAnalytics, isLoading: isLoadingSales} = useQuery<PosSalesAnalyticsInterface>({
        queryKey: ['beverage-sales', 'analytics', 'sales', startDate, endDate, granularity],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getSalesAnalytics(queryParams);
            return response.data?.data!;
        },
    });

    const {data: profitLoss, isLoading: isLoadingPL} = useQuery<PosProfitLossInterface>({
        queryKey: ['beverage-sales', 'reports', 'profit-loss', profitLossParams.period, profitLossParams.startDate ?? null, profitLossParams.endDate ?? null],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getProfitLoss(profitLossParams);
            return response.data?.data!;
        },
        enabled: !isCustom || !!(customStartDate && customEndDate),
    });

    const summary = analytics?.summary;
    const ordersByStatus = analytics?.ordersByStatus ?? [];
    const topProducts = analytics?.topProducts ?? [];
    const revenueData = React.useMemo(() => (analytics?.revenueOverTime ?? []).map(d => ({
        date: d.date,
        revenue: d.value
    })), [analytics?.revenueOverTime]);
    const ordersData = React.useMemo(() => (analytics?.ordersOverTime ?? []).map(d => ({
        date: d.date,
        orders: d.value
    })), [analytics?.ordersOverTime]);
    const productsByTable = analytics?.productsByTable ?? [];
    const topCustomers = salesAnalytics?.topCustomers ?? [];
    const salesByProduct = salesAnalytics?.salesByProduct ?? [];
    const salesByDayPart = salesAnalytics?.salesByDayPart ?? [];
    const productsChartData = React.useMemo(
        () => (salesAnalytics?.productsChart ?? []).map(p => ({name: p.label, value: p.value})),
        [salesAnalytics?.productsChart]
    );
    const productsChartConfig = React.useMemo(() => ({
        value: {label: "Chiffre d'affaires", color: CHART_COLORS[0]},
    }), []);

    const plSummary = profitLoss?.summary;
    const plBreakdown = React.useMemo(
        () => (profitLoss?.breakdown ?? []).map(d => ({
            date: d.date,
            revenue: d.revenue,
            expenses: d.expenses,
            profit: d.profit
        })),
        [profitLoss?.breakdown]
    );
    const plTopProducts = profitLoss?.topProducts ?? [];
    const plMargin = plSummary && plSummary.revenue > 0
        ? Math.round((plSummary.profit / plSummary.revenue) * 100)
        : 0;
    const plPeriodLabel = !profitLoss
        ? '—'
        : isCustom
            ? (customStartDate && customEndDate
                ? `${formatShortDate(customStartDate)} → ${formatShortDate(customEndDate)}`
                : 'Période personnalisée')
            : preset.periodLabel;

    const isLoadingAny = isLoading || isLoadingSales || isLoadingPL;

    if (isLoadingAny) {
        return (
            <div className="flex items-center justify-center w-full min-h-[60vh]">
                <div className="text-center">
                    <WaitingActivity size={40}/>
                    <p className="text-muted-foreground text-sm mt-4">Chargement des statistiques...</p>
                </div>
            </div>
        );
    }

    return (
        <RequireDepotSetup>
            <div className="flex flex-col gap-6 w-full">
                <Card className="border-none shadow-sm rounded-2xl p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
                            <CalendarIcon className="size-4 text-primary"/>
                            Période
                        </span>
                        {PERIOD_PRESETS.map((preset, idx) => (
                            <Button
                                key={preset.label}
                                variant={selectedPreset === idx ? "default" : "outline"}
                                size="sm"
                                className="rounded-full"
                                onClick={() => setSelectedPreset(idx)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                        {isCustom && (
                            <>
                                <Input
                                    type="date"
                                    className="w-auto rounded-full h-9"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                />
                                <span className="text-sm text-muted-foreground">à</span>
                                <Input
                                    type="date"
                                    className="w-auto rounded-full h-9"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                />
                            </>
                        )}
                        {/*<span*/}
                        {/*    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-xs font-medium text-muted-foreground"*/}
                        {/*    title="La granularité des graphiques s'adapte automatiquement à la période choisie"*/}
                        {/*>*/}
                        {/*    <BarChart3Icon className="size-3.5 text-primary"/>*/}
                        {/*    Granularité : {GRANULARITY_LABELS[granularity]}*/}
                        {/*</span>*/}
                    </div>
                </Card>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        label="Revenus"
                        value={formatPrice(summary?.totalRevenue ?? 0)}
                        hint="Sur la période sélectionnée"
                        icon={<BanknoteIcon className="size-4"/>}
                        color="emerald"
                    />
                    <KpiCard
                        label="Bénéfice net"
                        value={formatPrice(plSummary?.profit ?? 0)}
                        hint={plSummary ? `Marge de ${plMargin} %` : "Disponible via Points"}
                        icon={<TrendingUpIcon className="size-4"/>}
                        color="green"
                    />
                    <KpiCard
                        label="Commandes"
                        value={summary?.totalOrders ?? 0}
                        hint="Commandes payées"
                        icon={<ShoppingCartIcon className="size-4"/>}
                        color="blue"
                    />
                    <KpiCard
                        label="Panier moyen"
                        value={formatPrice(summary?.averageOrderValue ?? 0)}
                        hint="Par commande payée"
                        icon={<PercentIcon className="size-4"/>}
                        color="violet"
                    />
                </div>

                {profitLoss && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <MiniStat
                            label="Articles vendus"
                            value={String(summary?.totalItems ?? 0)}
                            icon={<PackageIcon className="size-4"/>}
                            color="amber"
                        />
                        <MiniStat
                            label="Dépenses (COGS)"
                            value={formatPrice(plSummary?.expenses ?? 0)}
                            icon={<TrendingDownIcon className="size-4"/>}
                            color="red"
                        />
                        <MiniStat
                            label="Marge brute"
                            value={`${plMargin} %`}
                            icon={<PercentIcon className="size-4"/>}
                            color="slate"
                        />
                        <MiniStat
                            label="Point"
                            value={plPeriodLabel}
                            icon={<ReceiptTextIcon className="size-4"/>}
                            color="cyan"
                        />
                    </div>
                )}

                {ordersByStatus.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground">Statuts :</span>
                        {ordersByStatus.map(s => (
                            <Badge key={s.status} variant="outline" className="px-3 py-1.5 text-sm gap-2 rounded-full">
                                <span className="text-muted-foreground">{s.status}</span>
                                <span className="font-bold">{s.count}</span>
                            </Badge>
                        ))}
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList variant="line">
                        <TabsTrigger value="overview" data-icon="inline-start">
                            <TrendingUpIcon/>
                            Vue d&apos;ensemble
                        </TabsTrigger>
                        <TabsTrigger value="products" data-icon="inline-start">
                            <PackageIcon/>
                            Produits
                        </TabsTrigger>
                        <TabsTrigger value="tables" data-icon="inline-start">
                            <WineIcon/>
                            Tables
                        </TabsTrigger>
                        <TabsTrigger value="customers" data-icon="inline-start">
                            <UsersIcon/>
                            Clients
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="flex flex-col gap-6 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard
                                title="Évolution des revenus"
                                description="Revenus sur la période"
                            >
                                <ChartContainer config={{revenue: {label: "Revenus", color: CHART_COLORS[0]}}}
                                                className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                                           className="stroke-muted/30"/>
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}
                                                   className="text-xs text-muted-foreground"/>
                                            <YAxis tickLine={false} axisLine={false}
                                                   tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                                   className="text-xs text-muted-foreground"/>
                                            <ChartTooltip content={<ChartTooltipContent/>}/>
                                            <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]}
                                                  strokeWidth={2} fill="url(#revenueGradient)"/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </ChartCard>

                            <ChartCard
                                title="Évolution des commandes"
                                description="Nombre de commandes payées sur la période"
                            >
                                <ChartContainer config={{orders: {label: "Commandes", color: CHART_COLORS[1]}}}
                                                className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={ordersData}>
                                            <defs>
                                                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                                           className="stroke-muted/30"/>
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}
                                                   className="text-xs text-muted-foreground"/>
                                            <YAxis tickLine={false} axisLine={false} allowDecimals={false}
                                                   className="text-xs text-muted-foreground"/>
                                            <ChartTooltip content={<ChartTooltipContent/>}/>
                                            <Area type="monotone" dataKey="orders" stroke={CHART_COLORS[1]}
                                                  strokeWidth={2} fill="url(#ordersGradient)"/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </ChartCard>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {salesByDayPart.length > 0 && <SalesByDayPartCard data={salesByDayPart}/>}

                            {productsChartData.length > 0 && (
                                <ChartCard
                                    title="Top 5 produits"
                                    description="Par chiffre d'affaires"
                                >
                                    <ChartContainer
                                        config={productsChartConfig}
                                        className="h-[300px] w-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={productsChartData} layout="vertical" margin={{left: 20}}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false}
                                                               className="stroke-muted/30"/>
                                                <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                                       className="text-xs"/>
                                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false}
                                                       tickMargin={8} className="text-xs" width={140}/>
                                                <ChartTooltip content={<ChartTooltipContent indicator="line"/>}/>
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                                    {productsChartData.map((_, i) => (
                                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </ChartCard>
                            )}
                        </div>

                        {profitLoss && plBreakdown.length > 0 && (
                            <ChartCard
                                title="Rentabilité : revenus, dépenses, bénéfice"
                                description={`Période : ${plPeriodLabel}`}
                            >
                                <ChartContainer
                                    config={{
                                        revenue: {label: "Revenus", color: CHART_COLORS[0]},
                                        expenses: {label: "Dépenses", color: CHART_COLORS[3]},
                                        profit: {label: "Bénéfice", color: CHART_COLORS[1]},
                                    }}
                                    className="h-[320px] w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={plBreakdown}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                                           className="stroke-muted/30"/>
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}
                                                   className="text-xs text-muted-foreground"/>
                                            <YAxis tickLine={false} axisLine={false}
                                                   tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                                   className="text-xs text-muted-foreground"/>
                                            <ChartTooltip content={<ChartTooltipContent indicator="line"/>}/>
                                            <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]}
                                                  strokeWidth={2} fill="url(#revenueGradient)"/>
                                            <Area type="monotone" dataKey="expenses" stroke={CHART_COLORS[3]}
                                                  strokeWidth={2} fill="none" strokeDasharray="4 4"/>
                                            <Area type="monotone" dataKey="profit" stroke={CHART_COLORS[1]}
                                                  strokeWidth={2} fill="none"/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </ChartCard>
                        )}

                        {plTopProducts.length > 0 && (
                            <Card className="border-none shadow-sm rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base">Top 10 produits par bénéfice</CardTitle>
                                    <CardDescription>Revenus, coût de revient et bénéfice net</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TopProductsByProfitTable products={plTopProducts}/>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="products" className="flex flex-col gap-6 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {topProducts.length > 0 && (
                                <Card className="border-none shadow-sm rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">Top 10 produits</CardTitle>
                                        <CardDescription>Les plus vendus en quantité</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <TopProductsTable products={topProducts}/>
                                    </CardContent>
                                </Card>
                            )}

                            {salesByProduct.length > 0 && (
                                <Card className="border-none shadow-sm rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">Ventes par produit</CardTitle>
                                        <CardDescription>Avec niveau de stock restant</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <SalesByProductTable products={salesByProduct} limit={15}/>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="tables" className="flex flex-col gap-6 pt-6">
                        {productsByTable.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {productsByTable.map((tableInfo, idx) => (
                                    <TablePerformanceCard key={tableInfo.tableId ?? tableInfo.tableLabel} tableInfo={tableInfo} rank={idx}/>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <WineIcon className="size-12 mx-auto mb-3 opacity-30"/>
                                <p>Aucune donnée par table pour cette période</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="customers" className="flex flex-col gap-6 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {topCustomers.length > 0 && (
                                <Card className="border-none shadow-sm rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">Top clients</CardTitle>
                                        <CardDescription>Classés par chiffre d&apos;affaires</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <TopCustomersList customers={topCustomers}/>
                                    </CardContent>
                                </Card>
                            )}

                            {salesByProduct.length > 0 && (
                                <Card className="border-none shadow-sm rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">Produits avec stock faible</CardTitle>
                                        <CardDescription>Produits vendus dont le stock est ≤ 10</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <LowStockProductsList products={salesByProduct}/>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </RequireDepotSetup>
    );
}

function KpiCard({label, value, hint, icon, color}: {
    label: string;
    value: string | number;
    hint?: string;
    icon: React.ReactNode;
    color: string
}) {
    const colorMap: Record<string, { gradient: string; icon: string }> = {
        emerald: {gradient: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20", icon: "bg-emerald-500/15 text-emerald-600"},
        blue: {gradient: "from-blue-500/10 to-blue-500/5 border-blue-500/20", icon: "bg-blue-500/15 text-blue-600"},
        amber: {gradient: "from-amber-500/10 to-amber-500/5 border-amber-500/20", icon: "bg-amber-500/15 text-amber-600"},
        violet: {gradient: "from-violet-500/10 to-violet-500/5 border-violet-500/20", icon: "bg-violet-500/15 text-violet-600"},
        red: {gradient: "from-red-500/10 to-red-500/5 border-red-500/20", icon: "bg-red-500/15 text-red-600"},
        green: {gradient: "from-green-500/10 to-green-500/5 border-green-500/20", icon: "bg-green-500/15 text-green-600"},
        slate: {gradient: "from-primary/10 to-primary/5 border-primary/20", icon: "bg-primary/15 text-primary"},
        cyan: {gradient: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20", icon: "bg-cyan-500/15 text-cyan-600"},
    };

    const palette = colorMap[color] ?? colorMap.slate;

    return (
        <Card className={`border rounded-2xl shadow-none bg-gradient-to-br ${palette.gradient} overflow-hidden`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">{label}</CardDescription>
                <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${palette.icon}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
                {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
            </CardContent>
        </Card>
    );
}

function MiniStat({label, value, icon, color}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string
}) {
    const colorMap: Record<string, string> = {
        amber: "text-amber-600",
        red: "text-red-600",
        slate: "text-primary",
        cyan: "text-cyan-600",
    };

    return (
        <Card className="border-none shadow-sm rounded-2xl bg-muted/20">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardDescription className="text-xs font-medium">{label}</CardDescription>
                <span className={`${colorMap[color] ?? ""}`}>{icon}</span>
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold tabular-nums tracking-tight">{value}</div>
            </CardContent>
        </Card>
    );
}

function ChartCard({title, description, children}: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
