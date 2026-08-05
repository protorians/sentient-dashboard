"use client"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Skeleton} from "@/core/presentation/ui/skeleton";
import {cn} from "@/core/infrastructure/utilities/utils";

export interface RadialWidgetChartSkeletonProps {
    title?: string
    description?: string
    footerTitle?: string
    footerDescription?: string
    className?: string
    hideCard?: boolean
}

export function RadialWidgetChartSkeleton(
    {
        title,
        description,
        footerTitle,
        footerDescription,
        className,
        hideCard = false,
    }: RadialWidgetChartSkeletonProps
) {
    const content = (
        <>
            {(title || description) && !hideCard && (
                <CardHeader className="items-center pb-0">
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
            <CardContent className={cn("flex flex-1 items-center justify-center pb-0", hideCard ? "p-0" : "")}>
                <Skeleton className="mx-auto aspect-square max-h-[250px] w-full rounded-full"/>
            </CardContent>
            {(footerTitle || footerDescription) && !hideCard && (
                <CardFooter className="flex-col items-center gap-2 text-sm">
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
        <Card className={cn("flex flex-col", className)}>
            {content}
        </Card>
    )
}
