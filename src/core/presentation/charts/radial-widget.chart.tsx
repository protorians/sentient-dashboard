"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {cn} from "@/core/infrastructure/utilities/utils";
import { RadialChartWidgetProps } from "../../domain/typing/chart-widgets.types";

export function RadialWidgetChart({
  data,
  config,
  title,
  description,
  footerTitle,
  footerDescription,
  dataKey,
  nameKey,
  startAngle = -90,
  endAngle = 380,
  innerRadius = 30,
  outerRadius = 110,
  className,
  hideCard = false,
}: RadialChartWidgetProps) {
  const content = (
    <>
      {(title || description) && !hideCard && (
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 pb-0", hideCard ? "p-0" : "")}>
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={data}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey={nameKey} />}
            />
            <RadialBar dataKey={dataKey} background>
              <LabelList
                position="insideStart"
                dataKey={nameKey}
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      {(footerTitle || footerDescription) && !hideCard && (
        <CardFooter className="flex-col gap-2 text-sm">
          {footerTitle && (
            <div className="flex items-center gap-2 leading-none font-medium">
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
    <Card className={cn("flex flex-col", className)}>
      {content}
    </Card>
  )
}
