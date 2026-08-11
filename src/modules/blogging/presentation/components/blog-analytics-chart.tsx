"use client"

import {Fragment, useEffect, useState} from "react";
import {AreaWidgetChart} from "@/core/presentation/charts/area-widget.chart";
import {AreaWidgetChartSkeleton} from "@/core/presentation/charts/area-widget.chart-skeleton";
import {ChartConfig} from "@/core/presentation/ui/chart";
import {bloggingAnalyticsRoutine} from "@/modules/blogging/infrastructure/routines/blogging-analytics.routine";

const chartConfig = {
    count: {
        label: "Articles",
        color: "var(--color-chart-1)",
    },
} satisfies ChartConfig

export function BlogAnalyticsChart() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {dataset: analytics} = bloggingAnalyticsRoutine.dataset()

    useEffect(() => {
        if (analytics?.summary) setIsLoading(false)
    }, [analytics])

    return (
        <div className="flex flex-col gap-4 py-6">
            {isLoading && (
                <div className="w-full h-[35dvh]">
                    <AreaWidgetChartSkeleton
                        title="Articles au fil du temps"
                        description="Nombre d'articles créés par période"
                        className="h-full"
                    />
                </div>
            )}
            {!isLoading && analytics?.summary && (
                <Fragment>
                    <div className="w-full h-[35dvh]">
                        <AreaWidgetChart
                            hideCard={false}
                            title="Articles au fil du temps"
                            description="Nombre d'articles créés par période"
                            data={analytics.postsOverTime || []}
                            config={chartConfig}
                            areas={[
                                {
                                    dataKey: "count",
                                    stroke: "var(--chart-1)",
                                }
                            ]}
                            xAxisDataKey="date"
                            className="h-full"
                        />
                    </div>
                </Fragment>
            )}
        </div>
    )
}
