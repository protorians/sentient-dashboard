"use client"

import {Fragment, useEffect, useState} from "react";
import {AreaWidgetChart} from "@/core/presentation/charts/area-widget.chart";
import {AreaWidgetChartSkeleton} from "@/core/presentation/charts/area-widget.chart-skeleton";
import {ChartConfig} from "@/core/presentation/ui/chart";
import {usersAnalyticsRoutine} from "@/modules/users/infrastructure/routines/users-analytics.routine";

const chartConfig = {
    count: {
        label: "Utilisateurs",
        color: "var(--color-chart-1)",
    },
} satisfies ChartConfig

export function UsersAnalyticsChart() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {dataset: analytics} = usersAnalyticsRoutine.dataset()

    // const {isLoading, data: analytics} = useQuery<UserAnalyticsInterface|null>({
    //     queryKey: ['users', 'analytics'],
    //     queryFn: async () => null
    //     // queryFn: async () => (await UsersApiService.getAnalytics()).data.data
    // })

    useEffect(() => {
        if (analytics && analytics.summary) setIsLoading(false)
    }, [analytics])

    return (
        <div className="flex flex-col gap-4 py-6">
            {isLoading && (
                <div className="w-full h-[40dvh]">
                    <AreaWidgetChartSkeleton
                        title="Utilisateurs au fil du temps"
                        description="Affichage du nombre d'utilisateurs inscrits par période"
                        className="h-full"
                    />
                </div>
            )}
            {
                !isLoading && analytics && analytics.summary && (
                    <Fragment>
                        <div className="w-full h-[40dvh]">
                            <AreaWidgetChart
                                hideCard={false}
                                title="Utilisateurs au fil du temps"
                                description="Affichage du nombre d'utilisateurs inscrits par période"
                                data={analytics.usersOverTime || []}
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
                )
            }
        </div>
    )
}