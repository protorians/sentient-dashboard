"use client"

import {useEffect, useState} from "react";
import {stockAnalyticsRoutine} from "@/modules/stock/infrastructure/routines/stock-analytics.routine";
import {AnalyticsSection} from "@/core/presentation/analytics-section";
import {WaitingSection} from "@/core/presentation/waiting-section";
import {cn} from "@/core/infrastructure/utilities/utils";

export function StockAnalyticsData() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {dataset: analytics} = stockAnalyticsRoutine.dataset()

    useEffect(() => {
        if (analytics) setIsLoading(false)
    }, [analytics])


    return (
        <div className="flex flex-col gap-4">
            {isLoading && (
                <WaitingSection label={'Récupération des statistiques'} className={cn("min-h-25")}/>
            )}
            <AnalyticsSection
                direction={"vertical"}
                items={[
                    {
                        label: 'Total',
                        value: analytics?.summary?.totalProducts || 0,
                        title: <>Produits total</>,
                        description: <>Le nombre de tous les produits enregistrés</>,
                    },
                    {
                        label: 'Alertes',
                        value: analytics?.summary?.lowStockCount || 0,
                        title: <>Produits en stock faible</>,
                        description: <>Le nombre de produits sous le seuil d'alerte</>
                    },
                    {
                        label: 'Ruptures',
                        value: analytics?.summary?.outOfStockCount || 0,
                        title: <>Produits en rupture de stock</>,
                        description: <>Le nombre de produits sans stock disponible</>
                    },
                    {
                        label: 'Mouvements',
                        value: analytics?.summary?.totalMovements || 0,
                        title: <>Mouvements total</>,
                        description: <>Le nombre total de mouvements enregistrés</>
                    },
                ]}
            />
        </div>
    )
}
