"use client"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Skeleton} from "@/core/presentation/ui/skeleton";
import {cn} from "@/core/infrastructure/utilities/utils";

export interface RadarWidgetChartSkeletonProps {
    title?: string
    description?: string
    footerTitle?: string
    footerDescription?: string
    className?: string
    hideCard?: boolean
}

export function RadarWidgetChartSkeleton(
    {
        title,
        description,
        footerTitle,
        footerDescription,
        className,
        hideCard = false,
    }: RadarWidgetChartSkeletonProps
) {
    const content = (
        <>
            {(title || description) && !hideCard && (
                <CardHeader className="items-center pb-4">
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
            <CardContent className={cn("pb-0", hideCard ? "p-0" : "")}>
                <Skeleton
                    className={cn(
                        "mx-auto aspect-square max-h-[250px] w-full rounded-none",
                        "[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]",
                        hideCard && "max-h-none"
                    )}
                />
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
        <Card className={className}>
            {content}
        </Card>
    )
}
