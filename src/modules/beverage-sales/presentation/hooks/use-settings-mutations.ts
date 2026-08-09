"use client"

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {CreateWarehouseInterface, UpdateWarehouseInterface} from "@/modules/stock/domain/warehouse.interface";
import {PaymentMethodInterface} from "@/modules/beverage-sales/domain/payment-method.interface";
import {toast} from "sonner";

export type PaymentMethodPayload = Omit<PaymentMethodInterface, "id" | "organizationId" | "createdAt">;

export function useSettingsMutations() {
    const queryClient = useQueryClient();

    const invalidateWarehouses = () => queryClient.invalidateQueries({queryKey: ['stock', 'warehouses']});
    const invalidatePaymentMethods = () => queryClient.invalidateQueries({queryKey: ['billing', 'payment-methods']});

    const createWarehouseMutation = useMutation({
        mutationFn: (payload: CreateWarehouseInterface) => StockApiService.createWarehouse(payload),
        onSuccess: () => {
            invalidateWarehouses();
            toast.success("Dépôt créé avec succès");
        }
    });

    const updateWarehouseMutation = useMutation({
        mutationFn: ({id, payload}: { id: string; payload: UpdateWarehouseInterface }) =>
            StockApiService.updateWarehouse(id, payload),
        onSuccess: () => {
            invalidateWarehouses();
            toast.success("Dépôt modifié avec succès");
        }
    });

    const deleteWarehouseMutation = useMutation({
        mutationFn: (id: string) => StockApiService.deleteWarehouse(id),
        onSuccess: () => {
            invalidateWarehouses();
            toast.success("Dépôt supprimé");
        }
    });

    const createPaymentMethodMutation = useMutation({
        mutationFn: (payload: PaymentMethodPayload) => BillingApiService.addPaymentMethod(payload),
        onSuccess: () => {
            invalidatePaymentMethods();
            toast.success("Moyen de paiement créé");
        }
    });

    const updatePaymentMethodMutation = useMutation({
        mutationFn: ({id, payload}: { id: string; payload: PaymentMethodPayload }) =>
            BillingApiService.updatePaymentMethod(id, payload),
        onSuccess: () => {
            invalidatePaymentMethods();
            toast.success("Moyen de paiement modifié");
        }
    });

    const deletePaymentMethodMutation = useMutation({
        mutationFn: (id: string) => BillingApiService.deletePaymentMethod(id),
        onSuccess: () => {
            invalidatePaymentMethods();
            toast.success("Moyen de paiement supprimé");
        }
    });

    return {
        createWarehouseMutation,
        updateWarehouseMutation,
        deleteWarehouseMutation,
        createPaymentMethodMutation,
        updatePaymentMethodMutation,
        deletePaymentMethodMutation,
    };
}
