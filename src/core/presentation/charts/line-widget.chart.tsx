"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import { LineChartWidgetProps } from "../../domain/typing/chart-widgets.types";

export function LineWidgetChart({
  data,
  config,
  title,
  description,
  footerTitle,
  footerDescription,
  lines,
  xAxisDataKey = "month",
  className,
  hideCard = false
}: LineChartWidgetProps) {
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
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisDataKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                dataKey={line.dataKey}
                type="natural"
                stroke={line.stroke || `var(--color-${line.dataKey})`}
                strokeWidth={2}
                dot={{
                  fill: line.stroke || `var(--color-${line.dataKey})`,
                }}
                activeDot={{
                  r: 6,
                }}
              >
                {line.showLabel && (
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                )}
              </Line>
            ))}
          </LineChart>
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
