"use client"

import {useRouter} from "next/navigation";
import {ArrowLeftIcon, WineIcon, WarehouseIcon} from "lucide-react";
import {Button} from "@/core/presentation/ui/button";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";

export function BeverageSalesHeaderBranding() {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3">
            <Button onClick={() => router.back()} variant="outline" size="lg">
                <ArrowLeftIcon/>
                Quitter
            </Button>
            <div className="bg-primary/10 p-2.5 rounded-xl">
                <WineIcon className="size-6 text-primary"/>
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Vente de Boissons</h1>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <WarehouseIcon className="size-3.5"/>
                    Caisse dédiée au dépôt ({WarehouseTypeEnum.BEVERAGE_DEPOT}) · gros, semi-gros et détail
                </p>
            </div>
        </div>
    );
}
