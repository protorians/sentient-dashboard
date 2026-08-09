"use client"

import React, {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {WarehouseInterface} from "@/modules/stock/domain/warehouse.interface";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {DepotSetupDialog} from "@/modules/beverage-sales/presentation/components/depot-setup-dialog";
import {WaitingActivity} from "@/core/presentation/waiting-activity";

interface RequireDepotSetupProps {
    children: React.ReactNode;
}

export function RequireDepotSetup({children}: RequireDepotSetupProps) {
    const {data: warehouses} = useQuery<WarehouseInterface[]>({
        queryKey: ['stock', 'warehouses'],
        queryFn: async () => {
            const response = await StockApiService.getWarehouses();
            return response.data?.data || [];
        }
    });

    const depotWarehouseId = useMemo(() => {
        return warehouses?.find(w => w.type === WarehouseTypeEnum.BEVERAGE_DEPOT)?.id;
    }, [warehouses]);

    const showDepotSetup = warehouses !== undefined && !depotWarehouseId;

    if (showDepotSetup) {
        return (
            <>
                <DepotSetupDialog show={true} />
                <div className="flex items-center justify-center w-full max-w-screen min-h-[60vh] bg-transparent">
                    <div className="text-center">
                        <WaitingActivity size={40} />
                        <p className="text-muted-foreground text-sm mt-4">Initialisation du module...</p>
                    </div>
                </div>
            </>
        );
    }

    return <>{children}</>;
}
