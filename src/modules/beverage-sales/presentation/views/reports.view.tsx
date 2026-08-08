"use client"

import React from "react";
import {useQuery} from "@tanstack/react-query";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/core/presentation/ui/card";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer} from "recharts";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {PosProfitLossInterface} from "@/modules/beverage-sales/domain/pos-profit-loss.interface";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {BanknoteIcon, TrendingDownIcon, TrendingUpIcon, PackageIcon, ShoppingCartIcon} from "lucide-react";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";
import {Button} from "@/core/presentation/ui/button";
import {Input} from "@/core/presentation/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/core/presentation/ui/table";

type PeriodKey = 'day' | 'week' | 'month' | 'year' | 'custom';

const PERIOD_LABELS: Record<PeriodKey, string> = {
    day: 'Jour',
    week: 'Semaine',
    month: 'Mois',
    year: 'Année',
    custom: 'Période personnalisée',
};

export default function ReportsView() {
    const [period, setPeriod] = React.useState<PeriodKey>('day');
    const [customStartDate, setCustomStartDate] = React.useState<string>('');
    const [customEndDate, setCustomEndDate] = React.useState<string>('');

    const queryParams: Record<string, string> = {period};
    if (period === 'custom') {
        if (customStartDate) queryParams.startDate = customStartDate;
        if (customEndDate) queryParams.endDate = customEndDate;
    }

    const {data: profitLoss, isLoading} = useQuery<PosProfitLossInterface>({
        queryKey: ['beverage-sales', 'reports', 'profit-loss', period, customStartDate, customEndDate],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getProfitLoss(queryParams);
            return response.data?.data!;
        },
        enabled: period !== 'custom' || !!(customStartDate && customEndDate),
    });

    const breakdownChartConfig = {
        revenue: {label: "Revenus", color: "hsl(var(--chart-1))"},
        expenses: {label: "Dépenses", color: "hsl(var(--chart-4))"},
        profit: {label: "Bénéfice", color: "hsl(var(--chart-2))"},
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <WaitingActivity size={40} />
                    <p className="text-muted-foreground text-sm mt-4">Calcul des points en cours...</p>
                </div>
            </div>
        );
    }

    const summary = profitLoss?.summary;
    const breakdown = profitLoss?.breakdown ?? [];
    const topProducts = profitLoss?.topProducts ?? [];
    const profitLabel = profitLoss?.period ?? PERIOD_LABELS[period];

    let profitColor = "text-green-600";
    if ((summary?.profit ?? 0) < 0) profitColor = "text-red-600";
    else if ((summary?.profit ?? 0) === 0) profitColor = "text-muted-foreground";

    let profitIcon = <TrendingUpIcon className="size-4 text-green-500" />;
    if ((summary?.profit ?? 0) < 0) profitIcon = <TrendingDownIcon className="size-4 text-red-500" />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    variant={period === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('day')}
                >
                    Journalier
                </Button>
                <Button
                    variant={period === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('week')}
                >
                    Hebdomadaire
                </Button>
                <Button
                    variant={period === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('month')}
                >
                    Mensuel
                </Button>
                <Button
                    variant={period === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('year')}
                >
                    Annuel
                </Button>
                <Button
                    variant={period === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod('custom')}
                >
                    Personnalisée
                </Button>
                {period === 'custom' && (
                    <div className="flex items-center gap-2 ml-2">
                        <Input
                            type="date"
                            className="w-auto"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                        <span className="text-muted-foreground text-sm">à</span>
                        <Input
                            type="date"
                            className="w-auto"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">Point {profitLabel.toLowerCase()}</h2>
                {profitLoss && (
                    <p className="text-sm text-muted-foreground">
                        du {new Date(profitLoss.periodStart).toLocaleDateString('fr-FR')} au {new Date(profitLoss.periodEnd).toLocaleDateString('fr-FR')}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Revenus</CardTitle>
                        <BanknoteIcon className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(summary?.revenue ?? 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">XOF</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses</CardTitle>
                        <TrendingDownIcon className="size-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatPrice(summary?.expenses ?? 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">XOF (coût de revient)</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Bénéfice</CardTitle>
                        {profitIcon}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${profitColor}`}>{formatPrice(summary?.profit ?? 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">XOF</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
                        <ShoppingCartIcon className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.orderCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">payées</p>
                    </CardContent>
                </Card>
            </div>

            {breakdown.length > 0 && (
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Évolution revenus / dépenses / bénéfice</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={breakdownChartConfig} className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={breakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}

            {topProducts.length > 0 && (
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PackageIcon className="size-4 text-primary" />
                            <CardTitle className="text-lg">Top produits par bénéfice</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Quantité</TableHead>
                                    <TableHead className="text-right">Revenus</TableHead>
                                    <TableHead className="text-right">Dépenses</TableHead>
                                    <TableHead className="text-right">Bénéfice</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProducts.map((tp) => (
                                    <TableRow key={tp.productId}>
                                        <TableCell className="font-medium">{tp.productName}</TableCell>
                                        <TableCell className="text-muted-foreground">{tp.sku}</TableCell>
                                        <TableCell className="text-right">{tp.quantity}</TableCell>
                                        <TableCell className="text-right">{formatPrice(tp.revenue)}</TableCell>
                                        <TableCell className="text-right text-red-600">{formatPrice(tp.expenses)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatPrice(tp.profit)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
