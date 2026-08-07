"use client"

import {useMemo} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {CreateOrderInterface, UpdateOrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {WarehouseInterface} from "@/modules/stock/domain/warehouse.interface";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {toast} from "sonner";

export function useBeverageSalesMutations(warehouses?: WarehouseInterface[]) {
    const queryClient = useQueryClient();

    const depotWarehouseId = useMemo(() => {
        return warehouses?.find(w => w.type === WarehouseTypeEnum.DEPOT)?.id;
    }, [warehouses]);

    const createOrderMutation = useMutation({
        mutationFn: (newOrder: CreateOrderInterface) => BeverageSalesApiService.createOrder(newOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['beverage-sales', 'orders']});
            toast.success("Commande créée avec succès");
        }
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: ({id, status}: { id: string, status: OrderStatusEnum }) =>
            BeverageSalesApiService.updateOrderStatus(id, {status}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['beverage-sales', 'orders']});
            toast.success("Statut de la commande mis à jour");
        }
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (id: string) => BeverageSalesApiService.updateOrderStatus(id, {status: OrderStatusEnum.CANCELLED}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['beverage-sales', 'orders']});
            toast.success("Commande annulée");
        }
    });

    const updateOrderMutation = useMutation({
        mutationFn: ({id, payload}: { id: string, payload: UpdateOrderInterface }) =>
            BeverageSalesApiService.updateOrder(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['beverage-sales', 'orders']});
        }
    });

    const saveBundleMutation = useMutation({
        mutationFn: ({bundle, payload}: { bundle: BundleInterface | null, payload: any }) =>
            bundle
                ? BeverageSalesApiService.updateBundle(bundle.id, payload)
                : BeverageSalesApiService.createBundle(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['beverage-sales', 'bundles']});
            toast.success("Bundle enregistré avec succès");
        }
    });

    const deleteBundleMutation = useMutation({
        mutationFn: (id: string) => BeverageSalesApiService.deleteBundle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['beverage-sales', 'bundles']});
            toast.success("Bundle supprimé");
        }
    });

    const createTableMutation = useMutation({
        mutationFn: (payload: { label: string; number?: number; warehouseId: string }) =>
            BeverageSalesApiService.createTable(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['beverage-sales', 'tables']});
        }
    });

    return {
        createOrderMutation,
        updateOrderStatusMutation,
        deleteOrderMutation,
        updateOrderMutation,
        saveBundleMutation,
        deleteBundleMutation,
        createTableMutation,
        depotWarehouseId,
    };
}
