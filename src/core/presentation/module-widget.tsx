"use client"

import * as React from "react"
import {ReactNode} from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
    CardAction
} from "@/core/presentation/ui/card"
import {StatisticalProps} from "@/core/domain/typing/statisticals"
import {EqualIcon, TrendingDownIcon, TrendingUpIcon} from "lucide-react"
import {Badge} from "@/core/presentation/ui/badge"
import {cn} from "@/core/infrastructure/utilities/utils"
import {ListItems, ListItemType} from "@/core/presentation/list-items"
import {
    AreaChartWidgetProps,
    LineChartWidgetProps,
    PieChartWidgetProps,
    RadarChartWidgetProps,
    RadialChartWidgetProps,
    RadialStackedChartWidgetProps,
    TooltipChartWidgetProps
} from "@/core/domain/typing/chart-widgets.types"
import {AreaWidgetChart} from "@/core/presentation/charts/area-widget.chart"
import {LineWidgetChart} from "@/core/presentation/charts/line-widget.chart"
import {PieWidgetChart} from "@/core/presentation/charts/pie-widget.chart"
import {RadarWidgetChart} from "@/core/presentation/charts/radar-widget.chart"
import {RadialWidgetChart} from "@/core/presentation/charts/radial-widget.chart"
import {RadialStackedWidgetChart} from "@/core/presentation/charts/radial-stacked-widget.chart"
import {TooltipWidgetChart} from "@/core/presentation/charts/tooltip-widget.chart"

export type ChartProps =
    | ({ variant: 'chart:area' } & AreaChartWidgetProps)
    | ({ variant: 'chart:line' } & LineChartWidgetProps)
    | ({ variant: 'chart:pie' } & PieChartWidgetProps)
    | ({ variant: 'chart:radar' } & RadarChartWidgetProps)
    | ({ variant: 'chart:radial' } & RadialChartWidgetProps)
    | ({ variant: 'chart:radial-stacked' } & RadialStackedChartWidgetProps)
    | ({ variant: 'chart:tooltip' } & TooltipChartWidgetProps);

export interface ModuleWidgetProps {
    title?: ReactNode
    description?: ReactNode
    stats?: StatisticalProps[]
    children?: ReactNode
    footer?: ReactNode
    actions?: ReactNode
    items?: ListItemType
    itemsHeader?: ReactNode
    itemsFooter?: ReactNode
    className?: string
    contentClassName?: string;
    chartVariant?: 'default' | 'chart:pie' | 'chart:bar' | 'chart:line' | 'chart:area' | 'chart:radar' | 'chart:radial' | 'chart:tooltip' | 'chart:radial-stacked';
    chart?: AreaChartWidgetProps | LineChartWidgetProps | PieChartWidgetProps | RadarChartWidgetProps | RadialChartWidgetProps | RadialStackedChartWidgetProps | TooltipChartWidgetProps;
}

export function ModuleWidget(
    {
        title,
        description,
        stats,
        children,
        footer,
        actions,
        items,
        itemsHeader,
        itemsFooter,
        className,
        contentClassName,
        chartVariant,
        chart
    }: ModuleWidgetProps) {

    const renderChart = () => {
        if (!chartVariant || chartVariant === 'default' || !chart) return null;

        const commonProps = {
            ...chart,
            hideCard: true
        };

        switch (chartVariant) {
            case 'chart:area':
                return <AreaWidgetChart {...commonProps as any} />;
            case 'chart:line':
                return <LineWidgetChart {...commonProps as any} />;
            case 'chart:pie':
                return <PieWidgetChart {...commonProps as any} />;
            case 'chart:radar':
                return <RadarWidgetChart {...commonProps as any} />;
            case 'chart:radial':
                return <RadialWidgetChart {...commonProps as any} />;
            case 'chart:radial-stacked':
                return <RadialStackedWidgetChart {...commonProps as any} />;
            case 'chart:tooltip':
                return <TooltipWidgetChart {...commonProps as any} />;
            case 'chart:bar':
                return <TooltipWidgetChart {...commonProps as any} />;
            default:
                return null;
        }
    }

    const chartContent = renderChart();

    return (
        <Card className={cn("@container/module-widget h-full min-h-[40dvh]", className)}>
            {(title || description || actions) && (
                <CardHeader>
                    <div className="flex flex-col gap-1">
                        {title && <CardTitle>{title}</CardTitle>}
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    {actions && <CardAction>{actions}</CardAction>}
                </CardHeader>
            )}
            <CardContent className={cn("flex flex-col gap-4", contentClassName)}>
                {stats && stats.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 @md/module-widget:grid-cols-2">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col gap-1">
                                {stat.label && (
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {stat.label}
                                    </div>
                                )}
                                <div className="text-2xl font-bold flex items-baseline gap-1">
                                    {stat.amount.toLocaleString()}
                                    {stat.devise && (
                                        <span
                                            className="text-xs font-normal text-muted-foreground">{stat.devise}</span>)}
                                    {stat.trend !== undefined && (
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "h-5 px-1 text-[10px] gap-0.5 border-transparent bg-muted/50",
                                                    stat.trend > 0
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : (
                                                            stat.trend === 0 ?
                                                                "text-muted-foreground"
                                                                : "text-rose-600 dark:text-rose-400"
                                                        )
                                                )}
                                            >
                                                {stat.trend > 0 ? (
                                                    <TrendingUpIcon className="size-3"/>
                                                ) : (
                                                    (
                                                        stat.trend === 0 ?
                                                            <EqualIcon className="size-3"/>
                                                            : <TrendingDownIcon className="size-3"/>
                                                    )
                                                )}
                                                {Math.abs(stat.trend)}%
                                            </Badge>
                                            {stat.description && (
                                                <span
                                                    className="text-[10px] text-muted-foreground truncate">{stat.description}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
                {chartContent && <div className="w-full pt-2">{chartContent}</div>}
                {children}
            </CardContent>

            {items && (
                <ListItems
                    items={items}
                    header={itemsHeader}
                    footer={itemsFooter}
                    className="border-t pt-2"
                />
            )}

            {footer && (
                <CardFooter className="text-xs text-muted-foreground border-t bg-transparent py-3">
                    {footer}
                </CardFooter>
            )}
        </Card>
    )
}
