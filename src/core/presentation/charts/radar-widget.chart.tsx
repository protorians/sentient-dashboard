"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart as OriginalRadarChart } from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/core/presentation/ui/chart";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {cn} from "@/core/infrastructure/utilities/utils";
import { RadarChartWidgetProps } from "../../domain/typing/chart-widgets.types";

export function RadarWidgetChart({
  data,
  config,
  title,
  description,
  footerTitle,
  footerDescription,
  radars,
  polarAngleDataKey = "month",
  gridShape,
  className,
  hideCard = false,
}: RadarChartWidgetProps) {
  const content = (
    <>
      {(title || description) && !hideCard && (
        <CardHeader className="items-center pb-4">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("pb-0", hideCard ? "p-0" : "")}>
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <OriginalRadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey={polarAngleDataKey} />
            <PolarGrid gridType={gridShape} />
            {radars.map((radar) => (
              <Radar
                key={radar.dataKey}
                dataKey={radar.dataKey}
                fill={radar.fill || `var(--color-${radar.dataKey})`}
                fillOpacity={radar.fillOpacity ?? 0.6}
              />
            ))}
          </OriginalRadarChart>
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
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
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
