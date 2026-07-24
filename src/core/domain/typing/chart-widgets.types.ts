import { ChartConfig } from "@/core/presentation/ui/chart"

export interface BaseChartWidgetProps {
  data: any[]
  config: ChartConfig
  title?: string
  description?: string
  footerTitle?: string
  footerDescription?: string
  className?: string
  hideCard?: boolean
}

export interface AreaChartWidgetProps extends BaseChartWidgetProps {
  areas: {
    dataKey: string
    fill?: string
    stroke?: string
    stackId?: string
  }[]
  xAxisDataKey?: string
}

export interface LineChartWidgetProps extends BaseChartWidgetProps {
  lines: {
    dataKey: string
    stroke?: string
    showLabel?: boolean
  }[]
  xAxisDataKey?: string
}

export interface PieChartWidgetProps extends BaseChartWidgetProps {
  dataKey: string
  nameKey: string
  innerLabel?: string
}

export interface RadarChartWidgetProps extends BaseChartWidgetProps {
  radars: {
    dataKey: string
    fill?: string
    fillOpacity?: number
  }[]
  polarAngleDataKey?: string
  gridShape?: "polygon" | "circle"
}

export interface RadialStackedChartWidgetProps extends BaseChartWidgetProps {
  bars: {
    dataKey: string
    stackId?: string
    fill?: string
    cornerRadius?: number
  }[]
  innerRadius?: number
  outerRadius?: number
  endAngle?: number
  innerLabel?: string
}

export interface RadialChartWidgetProps extends BaseChartWidgetProps {
  dataKey: string
  nameKey: string
  startAngle?: number
  endAngle?: number
  innerRadius?: number
  outerRadius?: number
}

export interface TooltipChartWidgetProps extends BaseChartWidgetProps {
  bars: {
    dataKey: string
    stackId?: string
    fill?: string
    radius?: [number, number, number, number]
  }[]
  xAxisDataKey?: string
}
