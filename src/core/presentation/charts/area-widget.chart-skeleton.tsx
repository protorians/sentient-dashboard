"use client"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Skeleton} from "@/core/presentation/ui/skeleton";
import {cn} from "@/core/infrastructure/utilities/utils";

export interface AreaWidgetChartSkeletonProps {
    title?: string
    description?: string
    footerTitle?: string
    footerDescription?: string
    className?: string
    hideCard?: boolean
}

export function AreaWidgetChartSkeleton(
    {
        title,
        description,
        footerTitle,
        footerDescription,
        className,
        hideCard = false,
    }: AreaWidgetChartSkeletonProps
) {
    const content = (
        <>
            {(title || description) && !hideCard && (
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-5 w-48"/>
                    </CardTitle>
                    {description && (
                        <CardDescription>
                            <Skeleton className="h-4 w-64"/>
                        </CardDescription>
                    )}
                </CardHeader>
            )}
            <CardContent className={cn("w-full h-full", hideCard ? "p-0" : "flex-1")}>
                <Skeleton className={cn("w-full h-full min-h-52", hideCard && className)}/>
            </CardContent>
            {(footerTitle || footerDescription) && !hideCard && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    {footerTitle && <Skeleton className="h-4 w-40"/>}
                    {footerDescription && <Skeleton className="h-4 w-56"/>}
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
