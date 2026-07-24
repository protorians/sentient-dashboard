"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis } from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {cn} from "@/core/infrastructure/utilities/utils";
import { TooltipChartWidgetProps } from "../../domain/typing/chart-widgets.types";

export function TooltipWidgetChart({
  data,
  config,
  title,
  description,
  footerTitle,
  footerDescription,
  bars,
  xAxisDataKey = "date",
  className,
  hideCard = false,
}: TooltipChartWidgetProps) {
  const content = (
    <>
      {(title || description) && !hideCard && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={hideCard ? "p-0" : ""}>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey={xAxisDataKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  weekday: "short",
                })
              }}
            />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                stackId={bar.stackId || "a"}
                fill={bar.fill || `var(--color-${bar.dataKey})`}
                radius={bar.radius}
              />
            ))}
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {(footerTitle || footerDescription) && !hideCard && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {footerTitle && (
            <div className="flex gap-2 leading-none font-medium">
              {footerTitle} <TrendingUp className="h-4 w-4" />
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
    <Card className={className}>
      {content}
    </Card>
  )
}
