"use client"

import {useEffect, useState} from "react";
import {bloggingAnalyticsRoutine} from "@/modules/blogging/infrastructure/routines/blogging-analytics.routine";
import {AnalyticsSection} from "@/core/presentation/analytics-section";
import {WaitingSection} from "@/core/presentation/waiting-section";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Badge} from "@/core/presentation/ui/badge";
import {cn} from "@/core/infrastructure/utilities/utils";
import {CalendarIcon, BarChart3Icon} from "lucide-react";

export function BlogAnalyticsData() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {dataset: analytics} = bloggingAnalyticsRoutine.dataset()

    useEffect(() => {
        if (analytics) setIsLoading(false)
    }, [analytics])

    return (
        <div className="flex flex-col gap-6">
            {isLoading && (
                <WaitingSection label={'Récupération des statistiques'} className={cn("min-h-25")}/>
            )}

            <AnalyticsSection
                direction={"vertical"}
                items={[
                    {
                        label: 'Total',
                        value: analytics?.summary?.totalPosts || 0,
                        title: <>Articles total</>,
                        description: <>Nombre total d&apos;articles créés</>,
                    },
                    {
                        label: 'Publiés',
                        value: analytics?.summary?.publishedPosts || 0,
                        title: <>Articles publiés</>,
                        description: <>Nombre d&apos;articles en ligne</>
                    },
                    {
                        label: 'Brouillons',
                        value: analytics?.summary?.draftPosts || 0,
                        title: <>Brouillons</>,
                        description: <>Articles en cours de rédaction</>
                    },
                    {
                        label: 'Catégories',
                        value: analytics?.summary?.totalCategories || 0,
                        title: <>Catégories</>,
                        description: <>Nombre de catégories disponibles</>
                    },
                ]}
            />

            {analytics?.postsByCategory && analytics.postsByCategory.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3Icon className="size-4 text-primary"/>
                            Par catégorie
                        </CardTitle>
                        <CardDescription>Répartition des articles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {analytics.postsByCategory.map((item) => (
                                <div key={item.categoryId}
                                     className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground truncate">{item.categoryTitle}</span>
                                    <Badge variant="outline">{item.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {analytics?.recentPosts && analytics.recentPosts.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CalendarIcon className="size-4 text-primary"/>
                            Articles récents
                        </CardTitle>
                        <CardDescription>Derniers articles publiés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {analytics.recentPosts.slice(0, 5).map((post) => (
                                <div key={post.id} className="flex flex-col gap-0.5 text-sm">
                                    <span className="font-medium truncate">{post.title}</span>
                                    <div className="flex items-center justify-between">
                                        {post.authorName && (
                                            <span className="text-xs text-muted-foreground">{post.authorName}</span>
                                        )}
                                        {post.publishedAt && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
