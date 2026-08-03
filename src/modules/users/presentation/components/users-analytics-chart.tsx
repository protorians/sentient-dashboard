"use client"

import {useQuery} from "@tanstack/react-query";
import {UsersApiService} from "@/modules/users/application/service/users-api-service";
import {WaitingSection} from "@/core/presentation/waiting-section";
import {AnalyticsSection} from "@/core/presentation/analytics-section";
import {Fragment, useEffect, useState} from "react";
import {
    UserAnalyticsInterface, UserStatsOverTimeInterface,
    UserStatsRoleInterface,
    UserStatsSummaryInterface
} from "@/modules/users/domain/users.interface";
import {cn} from "@/core/infrastructure/utilities/utils";
import {AreaWidgetChart} from "@/core/presentation/charts/area-widget.chart";
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
        if (analytics) setIsLoading(false)
    }, [analytics])

    return (
        <div className="flex flex-col gap-4 py-6">
            {isLoading && (
                <WaitingSection label={'Récupération des statistiques'} className={cn("min-h-25")}/>
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