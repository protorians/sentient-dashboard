"use client"

import {Fragment, useEffect, useState} from "react";
import {stockAnalyticsRoutine} from "@/modules/stock/infrastructure/routines/stock-analytics.routine";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {cn} from "@/core/infrastructure/utilities/utils";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {StockMovementTypeEnum} from "@/modules/stock/domain/enums/stock-movement-type.enum";
import {AreaWidgetChart} from "@/core/presentation/charts/area-widget.chart";
import {AreaWidgetChartSkeleton} from "@/core/presentation/charts/area-widget.chart-skeleton";
import {ChartConfig} from "@/core/presentation/ui/chart";

const chartConfig = {
    entries: {label: 'Entrées', color: 'var(--color-chart-1)'},
    exits: {label: 'Sorties', color: 'var(--color-chart-2)'},
    ruptures: {label: 'Ruptures', color: 'var(--color-chart-3)'},
    stockLevel: {label: 'Niveau de stock', color: 'var(--color-chart-4)'},
} satisfies ChartConfig

const movementTypeConfig: Record<string, { label: string; tone: string; bar: string }> = {
    [StockMovementTypeEnum.IN]: {label: 'Entrée', tone: 'text-emerald-600', bar: 'bg-emerald-500'},
    [StockMovementTypeEnum.OUT]: {label: 'Sortie', tone: 'text-rose-600', bar: 'bg-rose-500'},
    [StockMovementTypeEnum.ADJUSTMENT]: {label: 'Ajustement', tone: 'text-amber-600', bar: 'bg-amber-500'},
    [StockMovementTypeEnum.RETURN]: {label: 'Retour', tone: 'text-blue-600', bar: 'bg-blue-500'},
    [StockMovementTypeEnum.TRANSFER]: {label: 'Transfert', tone: 'text-purple-600', bar: 'bg-purple-500'},
};

const getMovementTypeConfig = (type: string) => movementTypeConfig[type] ?? {
    label: type,
    tone: 'text-muted-foreground',
    bar: 'bg-muted-foreground',
};

export function StockAnalyticsChart() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {dataset: analytics} = stockAnalyticsRoutine.dataset()

    useEffect(() => {
        if (analytics && analytics.summary) setIsLoading(false)
    }, [analytics])

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <div className="h-[40dvh]">
                    <AreaWidgetChartSkeleton
                        title="Évolution du stock"
                        description="Entrées, sorties, ruptures et niveau de stock par période"
                        className="h-full"
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-64 rounded-lg bg-muted/40 animate-pulse"/>
                    <div className="h-64 rounded-lg bg-muted/40 animate-pulse"/>
                </div>
            </div>
        )
    }

    const movementsByType = analytics?.movementsByType || []
    const maxCount = Math.max(1, ...movementsByType.map(m => m.count))
    const recentMovements = analytics?.recentMovements || []
    const charts = analytics?.charts
    const chartData = (charts?.entries || []).map((entry, index) => ({
        date: entry.date,
        entries: entry.count,
        exits: charts.exits?.[index]?.count ?? 0,
        ruptures: charts.ruptures?.[index]?.count ?? 0,
        stockLevel: charts.stockLevel?.[index]?.count ?? 0,
    }))

    const formatDate = (date?: string) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), "d MMM yyyy HH:mm", {locale: fr});
        } catch {
            return 'Date invalide';
        }
    };

    console.log('charts', charts)
    console.log('chartData', chartData)

    return (
        <Fragment>
            {chartData.length > 0 && (
                <div className="w-full h-[40dvh]">
                    <AreaWidgetChart
                        title="Évolution du stock"
                        description="Entrées, sorties, ruptures et niveau de stock par période"
                        data={chartData}
                        config={chartConfig}
                        areas={[
                            {dataKey: 'entries'},
                            {dataKey: 'exits'},
                            {dataKey: 'ruptures'},
                            {dataKey: 'stockLevel'},
                        ]}
                        xAxisDataKey="date"
                        className="h-full"
                    />
                </div>
            )}

            {/*<Card className="flex flex-col">*/}
            {/*    <CardHeader>*/}
            {/*        <CardTitle>Mouvements par type</CardTitle>*/}
            {/*        <CardDescription>Répartition des mouvements de stock enregistrés</CardDescription>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent className="flex flex-col gap-4 flex-auto">*/}
            {/*        {movementsByType.length === 0 && (*/}
            {/*            <div className="text-sm text-muted-foreground italic">Aucun mouvement enregistré</div>*/}
            {/*        )}*/}
            {/*        {movementsByType.map((item) => {*/}
            {/*            const config = getMovementTypeConfig(item.type)*/}
            {/*            const width = Math.round((item.count / maxCount) * 100)*/}
            {/*            return (*/}
            {/*                <div key={item.type} className="space-y-1.5">*/}
            {/*                    <div className="flex items-center justify-between text-sm">*/}
            {/*                        <span className={cn("font-medium", config.tone)}>{config.label}</span>*/}
            {/*                        <span className="tabular-nums text-muted-foreground">*/}
            {/*                            {item.count} mouvement(s) · {item.quantity} unité(s)*/}
            {/*                        </span>*/}
            {/*                    </div>*/}
            {/*                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">*/}
            {/*                        <div*/}
            {/*                            className={cn("h-full rounded-full", config.bar)}*/}
            {/*                            style={{width: `${width}%`}}*/}
            {/*                        />*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            )*/}
            {/*        })}*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}

            {/*<Card className="flex flex-col">*/}
            {/*    <CardHeader>*/}
            {/*        <CardTitle>Derniers mouvements</CardTitle>*/}
            {/*        <CardDescription>Les 5 dernières opérations de stock</CardDescription>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent className="flex-auto">*/}
            {/*        {recentMovements.length === 0 && (*/}
            {/*            <div className="text-sm text-muted-foreground italic">Aucun mouvement récent</div>*/}
            {/*        )}*/}
            {/*        {recentMovements.length > 0 && (*/}
            {/*            <div className="divide-y divide-border/50 border border-border/50 rounded-lg">*/}
            {/*                {recentMovements.map((movement) => {*/}
            {/*                    const config = getMovementTypeConfig(movement.type)*/}
            {/*                    return (*/}
            {/*                        <div key={movement.id} className="flex items-center justify-between py-2.5 px-3 gap-3">*/}
            {/*                            <div className="flex flex-col min-w-0">*/}
            {/*                                <span className="text-sm font-medium truncate">{movement.productName}</span>*/}
            {/*                                <span className={cn("text-xs", config.tone)}>{config.label}</span>*/}
            {/*                            </div>*/}
            {/*                            <div className="flex items-center gap-3 shrink-0">*/}
            {/*                                <span className="text-sm font-semibold tabular-nums">{movement.quantity}</span>*/}
            {/*                                <span className="text-xs text-muted-foreground">*/}
            {/*                                    {formatDate(movement.createdAt)}*/}
            {/*                                </span>*/}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                    )*/}
            {/*                })}*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}
        </Fragment>
    )
}
