"use client"

import * as React from "react"
import {Label, Pie, PieChart, Sector} from "recharts"
import type {
    PieSectorShapeProps,
} from "recharts/types/polar/Pie"
import {ChartConfig, ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/core/presentation/ui/select";
import {cn} from "@/core/infrastructure/utilities/utils";
import {PieChartWidgetProps} from "../../domain/typing/chart-widgets.types";


export function PieWidgetChart(
    {
        data,
        config,
        title,
        description,
        dataKey,
        nameKey,
        innerLabel = "Visitors",
        className,
        hideCard = false,
    }: PieChartWidgetProps) {
    const id = React.useId()
    const [activeMonth, setActiveMonth] = React.useState(data[0]?.[nameKey])

    const activeIndex = React.useMemo(
        () => data.findIndex((item) => item[nameKey] === activeMonth),
        [activeMonth, data, nameKey]
    )
    const keys = React.useMemo(() => data.map((item) => item[nameKey]), [data, nameKey])

    const renderPieShape = React.useCallback(
        ({index, outerRadius = 0, ...props}: PieSectorShapeProps) => {
            if (index === activeIndex) {
                return (
                    <g>
                        <Sector {...props} outerRadius={outerRadius + 10}/>
                        <Sector
                            {...props}
                            outerRadius={outerRadius + 25}
                            innerRadius={outerRadius + 12}
                        />
                    </g>
                )
            }

            return <Sector {...props} outerRadius={outerRadius}/>
        },
        [activeIndex]
    )

    const content = (
        <>
            {/*<ChartStyle id={id} config={config} />*/}
            {(title || description) && !hideCard && (
                <CardHeader className="flex-row items-start space-y-0 pb-0">
                    <div className="grid gap-1">
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                </CardHeader>
            )}
            <div className="flex flex-row items-center justify-end">
                <Select value={activeMonth} onValueChange={setActiveMonth}>
                    <SelectTrigger
                        className="w-[130px]"
                        aria-label="Choississez une entrée"
                    >
                        <SelectValue placeholder="Select item"/>
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {keys.map((key) => {
                            const itemConfig = config[key as keyof typeof config]

                            if (!itemConfig) {
                                return null
                            }

                            return (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="rounded-lg [&_span]:flex"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                      <span
                          className="flex h-3 w-3 shrink-0 rounded-xs"
                          style={{
                              backgroundColor: `var(--color-${key})`,
                          }}
                      />
                                        {itemConfig?.label}
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </div>
            <CardContent className={cn("flex flex-1 justify-center pb-0", hideCard ? "p-0" : "")}>
                <ChartContainer
                    id={id}
                    config={config}
                    className="mx-auto aspect-square w-full max-w-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel/>}
                        />
                        <Pie
                            data={data}
                            dataKey={dataKey}
                            nameKey={nameKey}
                            innerRadius={60}
                            strokeWidth={5}
                            shape={renderPieShape}
                        >
                            <Label
                                content={({viewBox}) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {data[activeIndex]?.[dataKey]?.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {innerLabel}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </>
    )

    if (hideCard) {
        return content
    }

    return (
        <Card data-chart={id} className={cn("flex flex-col", className)}>
            {content}
        </Card>
    )
}
