"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {PieChart, Pie, Cell, ResponsiveContainer} from "recharts";
import {SunriseIcon, SunIcon, SunsetIcon, MoonIcon, CoffeeIcon} from "lucide-react";
import {PosSalesByDayPart} from "@/modules/beverage-sales/domain/pos-sales-analytics.interface";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

const DAY_PART_META: Record<string, { icon: typeof SunriseIcon; color: string; description: string }> = {
    'matin': {
        icon: SunriseIcon,
        color: "var(--color-chart-3)",
        description: "Ouverture → pause de midi",
    },
    'pause': {
        icon: CoffeeIcon,
        color: "var(--color-chart-5)",
        description: "Pause de service (60 min)",
    },
    'après-midi': {
        icon: SunIcon,
        color: "var(--color-chart-1)",
        description: "Fin de pause → fermeture",
    },
    'hors-horaires': {
        icon: MoonIcon,
        color: "var(--color-chart-4)",
        description: "En dehors des horaires",
    },
    'fermé': {
        icon: SunsetIcon,
        color: "var(--color-chart-2)",
        description: "Jour de fermeture",
    },
};

const CHART_COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
];

export function SalesByDayPartCard({data}: { data: PosSalesByDayPart[] }) {
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = data.reduce((sum, d) => sum + d.orderCount, 0);

    const chartData = data.map((d, idx) => ({
        ...d,
        fill: CHART_COLORS[idx % CHART_COLORS.length],
    }));

    const chartConfig = Object.fromEntries(
        data.map((d) => [d.dayPart, {label: d.label, color: DAY_PART_META[d.dayPart]?.color ?? CHART_COLORS[0]}]),
    );

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
                <CardTitle className="text-base">Ventes par période de la journée</CardTitle>
                <CardDescription>
                    Répartition du chiffre d&apos;affaires selon les créneaux de la caisse
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="relative mx-auto size-56">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip
                                        content={<ChartTooltipContent indicator="dot"/>}
                                        wrapperStyle={{outline: "none"}}
                                    />
                                    <Pie
                                        data={chartData}
                                        dataKey="revenue"
                                        nameKey="label"
                                        innerRadius={62}
                                        outerRadius={92}
                                        paddingAngle={3}
                                        strokeWidth={2}
                                    >
                                        {chartData.map((entry) => (
                                            <Cell key={entry.dayPart} fill={entry.fill} className="outline-none"/>
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold tabular-nums tracking-tight">
                                {formatPrice(totalRevenue).replace(' FCFA', '')}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                FCFA · {totalOrders} commandes
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {data.map((d) => {
                            const meta = DAY_PART_META[d.dayPart] ?? {
                                icon: SunIcon,
                                color: CHART_COLORS[0],
                                description: "Période de la journée",
                            };
                            const Icon = meta.icon;
                            const share = totalRevenue > 0 ? Math.round((d.revenue / totalRevenue) * 100) : 0;
                            return (
                                <div
                                    key={d.dayPart}
                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                                >
                                    <div
                                        className="size-9 rounded-full flex items-center justify-center shrink-0"
                                        style={{
                                            backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
                                            color: meta.color,
                                        }}
                                    >
                                        <Icon className="size-4"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-medium">{d.label}</span>
                                            <span className="text-sm font-bold tabular-nums">{formatPrice(d.revenue)}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {d.orderCount} commande{d.orderCount > 1 ? 's' : ''} · {meta.description}
                                        </p>
                                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{width: `${share}%`, backgroundColor: meta.color}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
