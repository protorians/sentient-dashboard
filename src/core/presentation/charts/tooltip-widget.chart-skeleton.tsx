"use client"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Skeleton} from "@/core/presentation/ui/skeleton";

export interface TooltipWidgetChartSkeletonProps {
    title?: string
    description?: string
    footerTitle?: string
    footerDescription?: string
    className?: string
    hideCard?: boolean
}

export function TooltipWidgetChartSkeleton(
    {
        title,
        description,
        footerTitle,
        footerDescription,
        className,
        hideCard = false,
    }: TooltipWidgetChartSkeletonProps
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
            <CardContent className={hideCard ? "p-0" : ""}>
                <div className={hideCard ? "w-full" : "flex flex-col gap-2"}>
                    <Skeleton className="h-64 w-full"/>
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-2/3"/>
                </div>
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
