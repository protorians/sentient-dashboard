import {cn} from "@/core/infrastructure/utilities/utils";
import {Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Badge} from "@/core/presentation/ui/badge";
import {EqualApproximatelyIcon, TrendingDownIcon, TrendingUpIcon} from "lucide-react";
import React from "react";

export interface AnalyticSectionItemProps {
    label?: React.ReactNode;
    value?: React.ReactNode;
    actions?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    trend?: number;
    colspan?: number;
}

export interface AnalyticSectionProps {
    className?: string;
    items: AnalyticSectionItemProps[];
}

export function AnalyticsSection({className, items}: AnalyticSectionProps) {
    return (
        <div
            className={cn("grid grid-cols-1 md:grid-cols-4 gap-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card", className)}>
            {items.map((item, index) => (
                <Card
                    key={index}
                    className={cn(
                        "@container/card",
                        item.colspan === 2 && "md:col-span-2 @xl/main:col-span-2",
                        item.colspan === 3 && "md:col-span-3 @xl/main:col-span-2 @5xl/main:col-span-3",
                        item.colspan === 4 && "md:col-span-4 @xl/main:col-span-2 @5xl/main:col-span-4",
                    )}
                >
                    <CardHeader>
                        <CardDescription>{item.label}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {item.value}
                        </CardTitle>
                        <CardAction>
                            {/*{item.actions}*/}
                            {item.trend && (
                                <Badge variant="outline">
                                    {item.trend > 0 && <TrendingUpIcon/>}
                                    {item.trend < 0 && <TrendingDownIcon/>}
                                    {item.trend == 0 && <EqualApproximatelyIcon/>}
                                </Badge>)
                            }
                        </CardAction>
                    </CardHeader>
                    <div className="flex-auto"></div>
                    {(item.title || item.description) && (
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {item.title && (
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    {item.title}
                                </div>
                            )}
                            {item.description && (
                                <div className="text-muted-foreground">
                                    {item.description}
                                </div>
                            )}
                        </CardFooter>
                    )}
                </Card>
            ))}
        </div>
    )
}