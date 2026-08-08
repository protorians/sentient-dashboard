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
import {BanknoteIcon, ShoppingCartIcon, TrendingUpIcon, TrendingDownIcon, PackageIcon, UsersIcon, WineIcon, CalendarIcon, BarChart3Icon} from "lucide-react";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";
import {Button} from "@/core/presentation/ui/button";
import {Badge} from "@/core/presentation/ui/badge";
import {Input} from "@/core/presentation/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/core/presentation/ui/table";

const PERIOD_PRESETS = [
    { label: "Aujourd'hui", days: 0 },
    { label: "7 jours", days: 7 },
    { label: "30 jours", days: 30 },
    { label: "90 jours", days: 90 },
    { label: "Tout", days: -1 },
    { label: "Personnalisée", days: -2 },
];

const GRANULARITIES = [
    { label: "Min", value: "minute" },
    { label: "Heure", value: "hour" },
    { label: "Jour", value: "day" },
    { label: "Sem.", value: "week" },
    { label: "Mois", value: "month" },
    { label: "Année", value: "year" },
];

const CHART_COLORS = [
    "hsl(var(--color-chart-1))",
    "hsl(var(--color-chart-2))",
    "hsl(var(--color-chart-3))",
    "hsl(var(--color-chart-4))",
    "hsl(var(--color-chart-5))",
];

function dateDaysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
}

export default function BeverageSalesDashboardView() {
    const [activeTab, setActiveTab] = React.useState("overview");
    const [selectedPreset, setSelectedPreset] = React.useState(0);
    const [customStartDate, setCustomStartDate] = React.useState("");
    const [customEndDate, setCustomEndDate] = React.useState("");
    const [granularity, setGranularity] = React.useState("day");

    const isCustom = selectedPreset === PERIOD_PRESETS.length - 1;

    const startDate = !isCustom
        ? (selectedPreset >= 0 ? dateDaysAgo(PERIOD_PRESETS[selectedPreset].days) : undefined)
        : (customStartDate || undefined);

    const endDate = isCustom ? (customEndDate || undefined) : undefined;

    const queryParams: Record<string, string> = {granularity};
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    const profitLossParams: Record<string, string> = {};
    if (isCustom) {
        profitLossParams.period = "custom";
        if (customStartDate) profitLossParams.startDate = customStartDate;
        if (customEndDate) profitLossParams.endDate = customEndDate;
    } else {
        const preset = PERIOD_PRESETS[selectedPreset];
        if (preset.days === 0) profitLossParams.period = "day";
        else if (preset.days <= 7) profitLossParams.period = "week";
        else if (preset.days <= 30) profitLossParams.period = "month";
        else profitLossParams.period = "year";
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
        queryKey: ['beverage-sales', 'reports', 'profit-loss', profitLossParams.period, customStartDate, customEndDate],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getProfitLoss(profitLossParams);
            return response.data?.data!;
        },
        enabled: profitLossParams.period !== "custom" || !!(customStartDate && customEndDate),
    });

    const summary = analytics?.summary;
    const ordersByStatus = analytics?.ordersByStatus ?? [];
    const topProducts = analytics?.topProducts ?? [];
    const revenueData = React.useMemo(() => (analytics?.revenueOverTime ?? []).map(d => ({date: d.date, revenue: d.value})), [analytics?.revenueOverTime]);
    const ordersData = React.useMemo(() => (analytics?.ordersOverTime ?? []).map(d => ({date: d.date, orders: d.value})), [analytics?.ordersOverTime]);
    const productsByTable = analytics?.productsByTable ?? [];
    const topCustomers = salesAnalytics?.topCustomers ?? [];
    const salesByProduct = salesAnalytics?.salesByProduct ?? [];
    const productsChartData = React.useMemo(
        () => (salesAnalytics?.productsChart ?? []).map(p => ({name: p.label, value: p.value})),
        [salesAnalytics?.productsChart]
    );
    const productsChartConfig = React.useMemo(() => ({
        value: {label: "Chiffre d'affaires", color: CHART_COLORS[0]},
    }), []);

    const plSummary = profitLoss?.summary;
    const plBreakdown = React.useMemo(
        () => (profitLoss?.breakdown ?? []).map(d => ({date: d.date, revenue: d.revenue, expenses: d.expenses, profit: d.profit})),
        [profitLoss?.breakdown]
    );
    const plTopProducts = profitLoss?.topProducts ?? [];
    const plMargin = plSummary && plSummary.revenue > 0
        ? Math.round((plSummary.profit / plSummary.revenue) * 100)
        : 0;

    const isLoadingAny = isLoading || isLoadingSales || isLoadingPL;

    if (isLoadingAny) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <WaitingActivity size={40} />
                    <p className="text-muted-foreground text-sm mt-4">Chargement des statistiques...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 flex-wrap">
                <CalendarIcon className="size-4 text-muted-foreground" />
                {PERIOD_PRESETS.map((preset, idx) => (
                    <Button
                        key={preset.label}
                        variant={selectedPreset === idx ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPreset(idx)}
                    >
                        {preset.label}
                    </Button>
                ))}
                {isCustom && (
                    <>
                        <Input
                            type="date"
                            className="w-auto"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">à</span>
                        <Input
                            type="date"
                            className="w-auto"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                    </>
                )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
                <BarChart3Icon className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mr-1">Granularité :</span>
                {GRANULARITIES.map((g) => (
                    <Button
                        key={g.value}
                        variant={granularity === g.value ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setGranularity(g.value)}
                    >
                        {g.label}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Revenus"
                    value={formatPrice(summary?.totalRevenue ?? 0)}
                    icon={<BanknoteIcon className="size-4" />}
                    color="emerald"
                />
                <KpiCard
                    label="Commandes"
                    value={summary?.totalOrders ?? 0}
                    icon={<ShoppingCartIcon className="size-4" />}
                    color="blue"
                />
                <KpiCard
                    label="Articles vendus"
                    value={summary?.totalItems ?? 0}
                    icon={<PackageIcon className="size-4" />}
                    color="amber"
                />
                <KpiCard
                    label="Panier moyen"
                    value={formatPrice(summary?.averageOrderValue ?? 0)}
                    icon={<TrendingUpIcon className="size-4" />}
                    color="violet"
                />
            </div>

            {profitLoss && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        label="Dépenses (COGS)"
                        value={formatPrice(plSummary?.expenses ?? 0)}
                        icon={<TrendingDownIcon className="size-4" />}
                        color="red"
                    />
                    <KpiCard
                        label="Bénéfice net"
                        value={formatPrice(plSummary?.profit ?? 0)}
                        icon={<TrendingUpIcon className="size-4" />}
                        color="green"
                    />
                    <KpiCard
                        label="Marge"
                        value={`${plMargin} %`}
                        icon={<BarChart3Icon className="size-4" />}
                        color="slate"
                    />
                    <KpiCard
                        label="Rapport"
                        value={profitLoss.period}
                        icon={<CalendarIcon className="size-4" />}
                        color="cyan"
                    />
                </div>
            )}

            {ordersByStatus.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                    {ordersByStatus.map(s => (
                        <Badge key={s.status} variant="outline" className="px-3 py-1.5 text-sm gap-2">
                            <span className="text-muted-foreground">{s.status}</span>
                            <span className="font-bold">{s.count}</span>
                        </Badge>
                    ))}
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList variant="line">
                    <TabsTrigger value="overview" data-icon="inline-start">
                        <TrendingUpIcon />
                        Vue d&apos;ensemble
                    </TabsTrigger>
                    <TabsTrigger value="products" data-icon="inline-start">
                        <PackageIcon />
                        Produits
                    </TabsTrigger>
                    <TabsTrigger value="tables" data-icon="inline-start">
                        <WineIcon />
                        Tables
                    </TabsTrigger>
                    <TabsTrigger value="customers" data-icon="inline-start">
                        <UsersIcon />
                        Clients
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex flex-col gap-6 pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard
                            title="Évolution des revenus"
                            description="Revenus sur la période"
                        >
                            <ChartContainer config={{revenue: {label: "Revenus", color: CHART_COLORS[0]}}} className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs text-muted-foreground" />
                                        <YAxis tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} className="text-xs text-muted-foreground" />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#revenueGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </ChartCard>

                        <ChartCard
                            title="Évolution des commandes"
                            description="Nombre de commandes payées sur la période"
                        >
                            <ChartContainer config={{orders: {label: "Commandes", color: CHART_COLORS[1]}}} className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={ordersData}>
                                        <defs>
                                            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs text-muted-foreground" />
                                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} className="text-xs text-muted-foreground" />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area type="monotone" dataKey="orders" stroke={CHART_COLORS[1]} strokeWidth={2} fill="url(#ordersGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </ChartCard>
                    </div>

                    {profitLoss && plBreakdown.length > 0 && (
                        <ChartCard
                            title="Rentabilité : revenus, dépenses, bénéfice"
                            description={`Période : ${profitLoss.period}`}
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
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs text-muted-foreground" />
                                        <YAxis tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} className="text-xs text-muted-foreground" />
                                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                        <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#revenueGradient)" />
                                        <Area type="monotone" dataKey="expenses" stroke={CHART_COLORS[3]} strokeWidth={2} fill="none" strokeDasharray="4 4" />
                                        <Area type="monotone" dataKey="profit" stroke={CHART_COLORS[1]} strokeWidth={2} fill="none" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </ChartCard>
                    )}

                    {productsChartData.length > 0 && (
                        <ChartCard
                            title="Top 5 produits"
                            description="Par chiffre d'affaires"
                        >
                            <ChartContainer
                                config={productsChartConfig}
                                className="h-[320px] w-full"
                            >
                                <BarChart data={productsChartData} layout="vertical" margin={{left: 20}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted/30" />
                                    <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" width={140} />
                                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {productsChartData.map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </ChartCard>
                    )}

                    {plTopProducts.length > 0 && (
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Top 10 produits par bénéfice</CardTitle>
                                <CardDescription>Revenus, coût de revient et bénéfice net</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Produit</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead className="text-right">Qté</TableHead>
                                            <TableHead className="text-right">Revenus</TableHead>
                                            <TableHead className="text-right">Dépenses</TableHead>
                                            <TableHead className="text-right">Bénéfice</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plTopProducts.map((tp) => (
                                            <TableRow key={tp.productId}>
                                                <TableCell className="font-medium text-sm">{tp.productName}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs">{tp.sku}</TableCell>
                                                <TableCell className="text-right tabular-nums text-sm">{tp.quantity}</TableCell>
                                                <TableCell className="text-right tabular-nums text-sm">{formatPrice(tp.revenue)}</TableCell>
                                                <TableCell className="text-right tabular-nums text-sm text-red-600">{formatPrice(tp.expenses)}</TableCell>
                                                <TableCell className="text-right tabular-nums text-sm font-medium">{formatPrice(tp.profit)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="products" className="flex flex-col gap-6 pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {topProducts.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">Top 10 produits</CardTitle>
                                    <CardDescription>Les plus vendus en quantité</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead>Produit</TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead className="text-right">Qté</TableHead>
                                                <TableHead className="text-right">Revenus</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topProducts.map((p) => (
                                                <TableRow key={p.productId}>
                                                    <TableCell className="font-medium text-sm">{p.productName}</TableCell>
                                                    <TableCell className="text-muted-foreground text-xs">{p.sku}</TableCell>
                                                    <TableCell className="text-right tabular-nums text-sm">{p.quantity}</TableCell>
                                                    <TableCell className="text-right tabular-nums text-sm">{formatPrice(p.revenue)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {salesByProduct.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">Ventes par produit</CardTitle>
                                    <CardDescription>Avec niveau de stock restant</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead>Produit</TableHead>
                                                <TableHead className="text-right">Qté</TableHead>
                                                <TableHead className="text-right">Nbre cmd</TableHead>
                                                <TableHead className="text-right">Revenus</TableHead>
                                                <TableHead className="text-right">Stock</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {salesByProduct.slice(0, 15).map((sp) => (
                                                <TableRow key={sp.productId}>
                                                    <TableCell className="font-medium text-sm">
                                                        <div>{sp.productName}</div>
                                                        <div className="text-muted-foreground text-xs">{sp.sku}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-sm">{sp.quantity}</TableCell>
                                                    <TableCell className="text-right tabular-nums text-sm text-muted-foreground">{sp.orderCount}</TableCell>
                                                    <TableCell className="text-right tabular-nums text-sm">{formatPrice(sp.revenue)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        <Badge variant={sp.remainingStock <= 5 ? "destructive" : "secondary"} className="text-xs">
                                                            {sp.remainingStock}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="tables" className="flex flex-col gap-6 pt-6">
                    {productsByTable.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {productsByTable.map((tableInfo) => (
                                <Card key={tableInfo.tableLabel} className="border-none shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <WineIcon className="size-4 text-primary" />
                                            {tableInfo.tableLabel}
                                        </CardTitle>
                                        <CardDescription>
                                            {tableInfo.orderCount} commande{tableInfo.orderCount > 1 ? 's' : ''} · {formatPrice(tableInfo.totalRevenue)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {tableInfo.products.map((p) => (
                                                <div key={p.productId} className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground truncate max-w-[60%]">{p.productName}</span>
                                                    <div className="flex items-center gap-3 tabular-nums">
                                                        <span className="text-xs text-muted-foreground">×{p.quantity}</span>
                                                        <span className="font-medium">{formatPrice(p.revenue)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <WineIcon className="size-12 mx-auto mb-3 opacity-30" />
                            <p>Aucune donnée par table pour cette période</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="customers" className="flex flex-col gap-6 pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {topCustomers.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">Top clients</CardTitle>
                                    <CardDescription>Classés par chiffre d&apos;affaires</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {topCustomers.map((tc, idx) => (
                                            <div
                                                key={tc.customerId ?? `unknown-${idx}`}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex-shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-primary">{idx + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{tc.customerName ?? 'Client de passage'}</p>
                                                    <p className="text-xs text-muted-foreground">{tc.orderCount} commande{tc.orderCount > 1 ? 's' : ''}</p>
                                                </div>
                                                <span className="font-bold tabular-nums text-sm">{formatPrice(tc.totalRevenue)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {salesByProduct.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">Produits avec stock faible</CardTitle>
                                    <CardDescription>Produits vendus dont le stock est ≤ 10</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {salesByProduct
                                            .filter(sp => sp.remainingStock <= 10)
                                            .sort((a, b) => a.remainingStock - b.remainingStock)
                                            .map(sp => (
                                                <div key={sp.productId} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/20">
                                                    <span className="font-medium truncate max-w-[55%]">{sp.productName}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-muted-foreground text-xs">Vendus: {sp.quantity}</span>
                                                        <Badge variant={sp.remainingStock === 0 ? "destructive" : "outline"} className="text-xs">
                                                            Stock: {sp.remainingStock}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    {salesByProduct.filter(sp => sp.remainingStock <= 10).length === 0 && (
                                        <p className="text-center text-muted-foreground text-sm py-8">
                                            Tous les produits ont un stock suffisant
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function KpiCard({label, value, icon, color}: {label: string; value: string | number; icon: React.ReactNode; color: string}) {
    const colorMap: Record<string, string> = {
        emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
        blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
        amber: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
        violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20",
        red: "from-red-500/10 to-red-500/5 border-red-500/20",
        green: "from-green-500/10 to-green-500/5 border-green-500/20",
        slate: "from-slate-500/10 to-slate-500/5 border-slate-500/20",
        cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20",
    };

    return (
        <Card className={`border shadow-none bg-gradient-to-br ${colorMap[color] ?? ""}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{label}</CardDescription>
                <div className="size-8 rounded-lg bg-background/60 flex items-center justify-center text-foreground/60">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
            </CardContent>
        </Card>
    );
}

function ChartCard({title, description, children}: {title: string; description?: string; children: React.ReactNode}) {
    return (
        <Card className="border-none shadow-sm">
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
