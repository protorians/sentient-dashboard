"use client"

import {useQuery} from "@tanstack/react-query";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {PosOpenStatusInterface} from "@/modules/beverage-sales/domain/pos-preferences.interface";

export function useRegisterStatus(refetchInterval: number = 60_000) {
    return useQuery<PosOpenStatusInterface | null>({
        queryKey: ['beverage-sales', 'register-status'],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getPosRegisterStatus();
            return response.data?.data ?? null;
        },
        refetchInterval,
    });
}
