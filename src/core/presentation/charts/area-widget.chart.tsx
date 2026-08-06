"use client"

import {TrendingUp} from "lucide-react"
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/core/presentation/ui/chart";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {AreaChartWidgetProps} from "../../domain/typing/chart-widgets.types";
import {cn} from "@/core/infrastructure/utilities/utils";

export function AreaWidgetChart(
    {
        data,
        config,
        title,
        description,
        footerTitle,
        footerDescription,
        areas,
        xAxisDataKey = "month",
        xAxisFormatter,
        showLegend = areas.length > 1,
        className,
        hideCard = false,
    }: AreaChartWidgetProps
) {
    const formatTick = (value: string) => {
        if (xAxisFormatter) return xAxisFormatter(value)
        return String(value ?? "").trim()
    }
    const content = (
        <>
            {(title || description) && !hideCard && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent className={cn("w-full h-full", hideCard ? "p-0" : "flex-1", !hideCard && className)}>
                <ChartContainer config={config} className={cn("w-full h-full aspect-auto", hideCard && className)}>
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey={xAxisDataKey}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={formatTick}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line"/>}/>
                        {showLegend && (
                            <ChartLegend content={<ChartLegendContent/>}/>
                        )}
                        <defs>
                            {areas.map((area) => (
                                <linearGradient key={`fill-${area.dataKey}`} id={`fill-${area.dataKey}`} x1="0" y1="0"
                                                x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor={`var(--color-${area.dataKey})`}
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={`var(--color-${area.dataKey})`}
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        {areas.map((area) => (
                            <Area
                                key={area.dataKey}
                                dataKey={area.dataKey}
                                type="natural"
                                fill={`url(#fill-${area.dataKey})`}
                                fillOpacity={0.4}
                                stroke={area.stroke || `var(--color-${area.dataKey})`}
                                {...(area.stackId ? {stackId: area.stackId} : {})}
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            {(footerTitle || footerDescription) && !hideCard && (
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            {footerTitle && (
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    {footerTitle} <TrendingUp className="h-4 w-4"/>
                                </div>
                            )}
                            {footerDescription && (
                                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                                    {footerDescription}
                                </div>
                            )}
                        </div>
                    </div>
                </CardFooter>
            )}
        </>
    )

    if (hideCard) {
        return content
    }

    return (
        <Card className={className}>
            {content}
        </Card>
    )
}
