"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Skeleton} from "@/core/presentation/ui/skeleton";
import {cn} from "@/core/infrastructure/utilities/utils";

export interface PieWidgetChartSkeletonProps {
    title?: string
    description?: string
    className?: string
    hideCard?: boolean
}

export function PieWidgetChartSkeleton(
    {
        title,
        description,
        className,
        hideCard = false,
    }: PieWidgetChartSkeletonProps
) {
    const content = (
        <>
            {(title || description) && !hideCard && (
                <CardHeader className="flex-row items-start space-y-0 pb-0">
                    <div className="grid gap-1">
                        <CardTitle>
                            <Skeleton className="h-5 w-48"/>
                        </CardTitle>
                        {description && (
                            <CardDescription>
                                <Skeleton className="h-4 w-64"/>
                            </CardDescription>
                        )}
                    </div>
                </CardHeader>
            )}
            <div className="flex flex-row items-center justify-end pt-4">
                <Skeleton className="h-9 w-[130px]"/>
            </div>
            <CardContent className={cn("flex flex-1 justify-center pb-0", hideCard ? "p-0" : "")}>
                <Skeleton className="mx-auto aspect-square w-full max-w-[300px] rounded-full"/>
            </CardContent>
        </>
    )

    if (hideCard) {
        return content
    }

    return (
        <Card data-chart="skeleton" className={cn("flex flex-col", className)}>
            {content}
        </Card>
    )
}
