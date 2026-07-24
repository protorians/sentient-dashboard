"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {Button} from "@/core/presentation/ui/button";
import {BoxesIcon} from "lucide-react";
import {QueryFunction, useQuery} from "@tanstack/react-query";
import {Fragment, useState} from "react";
import {authUserConnectedStore} from "@/modules/auth/infrastructure/store/auth-user-connected.store";
import {WaitingBar} from "@/core/presentation/waiting-bar";
import {hasPermissions} from "@/core/infrastructure/utilities/permission.util";
import {DomainsEnum} from "@/core/domain/enums/domains.enum";
import {UsersApiService} from "@/modules/users/application/service/users-api-service";
import {ActivitiesType} from "@/core/domain/entities/activities.interface";
import {
    Timeline,
    TimelineContent,
    TimelineDate,
    TimelineHeader,
    TimelineIndicator,
    TimelineItem,
    TimelineSeparator,
    TimelineTitle
} from "@/components/reui/timeline";
import {explainActivity, explainActivityAction} from "@/core/infrastructure/utilities/activities.util";
import {Badge} from "@/core/presentation/ui/badge";
import {ActivityActionBadge} from "@/modules/dashboard/presentation/components/activity-action-badge";
import {cn} from "@/core/infrastructure/utilities/utils";
import {Waiting} from "@/core/presentation/waiting";


export interface UserActivitiesFeedProps {
    compacted?: boolean
}

export function UserActivitiesFeed({compacted = true}: UserActivitiesFeedProps) {
    const {getCurrentUser} = authUserConnectedStore()
    const getActivities: QueryFunction<any, any, any> = async ({}) => {
        const has = (getCurrentUser) ? hasPermissions(
            getCurrentUser.permissions,
            [DomainsEnum.Activity, DomainsEnum.UserActivity]
        ) : undefined;

        if (has === undefined) return null;
        const response = await UsersApiService[has ? 'getAllActivities' : 'getMyActivities']()
        return (Array.isArray(response.data.data) ? response.data.data : []) as ActivitiesType;
    }
    const {isLoading, data: activities} = useQuery<ActivitiesType>({
        queryKey: ['users', 'activities', 'feed'],
        queryFn: getActivities,
        refetchInterval: 30_000,
    })
    const [hoverIndex, setHoverIndex] = useState<number>(0)

    const emptyRender = () => {
        return (
            <Empty>
                <EmptyMedia>
                    <BoxesIcon size={80} strokeWidth={1}/>
                </EmptyMedia>
                <EmptyTitle>Aucune activités</EmptyTitle>
                <EmptyDescription>Vous n'avez encore aucune activité ici</EmptyDescription>
                <EmptyContent>
                    <Button variant="outline">Actualiser</Button>
                </EmptyContent>
            </Empty>
        )
    }
    const timelineRender = () => {

        return (
            <Fragment>
                {isLoading && <Waiting label={'Récupération des activités...'}/>}
                {!isLoading && activities && (
                    <div
                        className={"flex flex-col gap-4 w-full items-end"}>
                        <Timeline
                            defaultValue={1}
                            value={hoverIndex}
                            className="w-full max-w-md"
                        >
                            {activities.map((activity, index) => {
                                const date = Intl.DateTimeFormat('fr-FR', {
                                    month: 'long',
                                    year: 'numeric',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                })
                                    .format(new Date(activity.createdAt));
                                return (
                                    <Fragment key={activity.id}>
                                        <TimelineItem step={index + 1} onMouseEnter={() => setHoverIndex(index + 1)}>
                                            <TimelineHeader>
                                                <TimelineDate>{date}</TimelineDate>
                                                <TimelineTitle className={'flex flex-row gap-2 items-center'}>
                                                    <ActivityActionBadge action={activity.action}/>
                                                    <Badge variant="outline" className={'text-xs'}>
                                                        {activity.module?.toLowerCase()}
                                                    </Badge>
                                                </TimelineTitle>
                                            </TimelineHeader>
                                            <TimelineIndicator/>
                                            <TimelineSeparator/>
                                            <TimelineContent className={'text-foreground!'}>
                                                {activity.describe || explainActivity(activity)}
                                            </TimelineContent>
                                            <TimelineContent className={'text-xs!'}>
                                                {activity.description}
                                            </TimelineContent>
                                        </TimelineItem>
                                    </Fragment>
                                )
                            })}
                        </Timeline>

                    </div>
                )}
            </Fragment>
        )
    }

    return (
        <Fragment>
            {getCurrentUser && getCurrentUser.permissions && (
                <Card className={cn(
                    "flex flex-col h-full ",
                    compacted ? "max-h-[50dvh]" : "max-h-[80dvh]"
                )}>
                    <CardHeader>
                        <CardDescription>Activités</CardDescription>
                        <CardTitle></CardTitle>
                    </CardHeader>
                    <CardContent className={"flex flex-col flex-auto overflow-y-auto overflow-x-hidden"}>
                        {!getCurrentUser && emptyRender()}
                        {getCurrentUser && timelineRender()}
                    </CardContent>
                </Card>
            )}
        </Fragment>
    )
}