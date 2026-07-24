"use client"

import {TrendingUp} from "lucide-react"
import {
    Label,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {cn} from "@/core/infrastructure/utilities/utils";
import { RadialStackedChartWidgetProps } from "../../domain/typing/chart-widgets.types";

export function RadialStackedWidgetChart({
  data,
  config,
  title,
  description,
  footerTitle,
  footerDescription,
  bars,
  innerRadius = 80,
  outerRadius = 110,
  endAngle = 180,
  innerLabel = "Visitors",
  className,
  hideCard = false,
}: RadialStackedChartWidgetProps) {
    const totalValue = bars.reduce((acc, bar) => acc + (data[0]?.[bar.dataKey] || 0), 0)

    const content = (
        <>
            {(title || description) && !hideCard && (
                <CardHeader className="items-center pb-0">
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent className={cn("flex flex-1 items-center pb-0", hideCard ? "p-0" : "")}>
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square w-full max-w-[250px]"
                >
                    <RadialBarChart
                        data={data}
                        endAngle={endAngle}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                    >
                        {bars.map((bar) => (
                          <RadialBar
                              key={bar.dataKey}
                              dataKey={bar.dataKey}
                              fill={bar.fill || `var(--color-${bar.dataKey})`}
                              stackId={bar.stackId || "a"}
                              cornerRadius={bar.cornerRadius ?? 5}
                              className="stroke-transparent stroke-2"
                          />
                        ))}
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel/>}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({viewBox}) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 16}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {totalValue.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 4}
                                                    className="fill-muted-foreground"
                                                >
                                                    {innerLabel}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            {(footerTitle || footerDescription) && !hideCard && (
              <CardFooter className="flex-col gap-2 text-sm">
                  {footerTitle && (
                    <div className="flex items-center gap-2 leading-none font-medium">
                        {footerTitle} <TrendingUp className="h-4 w-4"/>
                    </div>
                  )}
                  {footerDescription && (
                    <div className="leading-none text-muted-foreground">
                        {footerDescription}
                    </div>
                  )}
              </CardFooter>
            )}
        </>
    )

    if (hideCard) {
        return content
    }

    return (
        <Card className={cn("flex flex-col", className)}>
            {content}
        </Card>
    )
}
