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

const chartConfig = {
    count: {
        label: "Utilisateurs",
        color: "var(--color-chart-1)",
    },
} satisfies ChartConfig

export function UsersAnalytics() {
    const {isLoading, data: analytics} = useQuery<UserAnalyticsInterface>({
        queryKey: ['users', 'analytics'],
        queryFn: async () => (await UsersApiService.getAnalytics()).data.data
    })

    return (
        <div className="flex flex-col gap-4 py-6">
            {isLoading && (
                <WaitingSection label={'Récupération des statistiques'} className={cn("min-h-25")}/>
            )}
            {
                !isLoading && analytics && analytics.summary && (
                    <Fragment>
                        <AnalyticsSection
                            items={[
                                {
                                    label: 'Total',
                                    value: analytics.summary.totalUsers || 0,
                                    title: <>Utilisateurs total</>,
                                    description: <>Le nombre de tous les utilisateurs inscrits</>,
                                    colspan: 2
                                },
                                {
                                    label: 'Actifs',
                                    value: analytics.summary.activeUsers || 0,
                                    title: <>Utilisateurs actifs</>,
                                    description: <>Le nombre d'utilisateurs actifs</>
                                },
                                {
                                    label: 'Ce mois',
                                    value: analytics.summary.newUsersThisMonth || 0,
                                    title: <>Utilisateurs inscrits ce mois-ci</>,
                                    description: <>Le nombre d'utilisateurs inscrits ce mois-ci</>
                                },
                            ]}
                        />
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