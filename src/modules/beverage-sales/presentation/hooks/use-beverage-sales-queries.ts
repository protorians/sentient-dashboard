"use client"

import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {WarehouseInterface} from "@/modules/stock/domain/warehouse.interface";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {OrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";

export interface EnrichedBundle extends BundleInterface {
    items: Array<BundleInterface["items"][number] & { product?: ProductInterface }>;
}

export interface UseBeverageSalesQueriesReturn {
    products: ProductInterface[] | undefined;
    isLoadingProducts: boolean;
    bundles: BundleInterface[] | undefined;
    isLoadingBundles: boolean;
    tables: PosTableInterface[] | undefined;
    isLoadingTables: boolean;
    warehouses: WarehouseInterface[] | undefined;
    orders: OrderInterface[] | undefined;
    isLoadingOrders: boolean;
    depotWarehouseId: string | undefined;
    enrichedBundles: EnrichedBundle[] | undefined;
    displayTables: PosTableInterface[] | undefined;
}

export function useBeverageSalesQueries(selectedTable: PosTableInterface | null): UseBeverageSalesQueriesReturn {
    const {data: products, isLoading: isLoadingProducts} = useQuery<ProductInterface[]>({
        queryKey: ['stock', 'products', 'beverage-sales'],
        queryFn: async () => {
            const response = await StockApiService.getAll();
            return response.data?.data || [];
        }
    });

    const {data: bundles, isLoading: isLoadingBundles} = useQuery<BundleInterface[]>({
        queryKey: ['beverage-sales', 'bundles'],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getBundles({page: 1, limit: 100});
            return response.data?.data?.data || [];
        }
    });

    const {data: tables, isLoading: isLoadingTables} = useQuery<PosTableInterface[]>({
        queryKey: ['beverage-sales', 'tables'],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getTables();
            return response.data?.data || [];
        }
    });

    const {data: warehouses} = useQuery<WarehouseInterface[]>({
        queryKey: ['stock', 'warehouses'],
        queryFn: async () => {
            const response = await StockApiService.getWarehouses();
            return response.data?.data || [];
        }
    });

    const {data: orders, isLoading: isLoadingOrders} = useQuery<OrderInterface[]>({
        queryKey: ['beverage-sales', 'orders'],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getOrders({warehouseType: WarehouseTypeEnum.DEPOT, limit: 50});
            return response.data?.data || [];
        }
    });

    const depotWarehouseId = useMemo(() => {
        return warehouses?.find(w => w.type === WarehouseTypeEnum.DEPOT)?.id;
    }, [warehouses]);

    const displayTables = useMemo(() => {
        const depotTables = depotWarehouseId
            ? (tables ?? []).filter(t => t.warehouseId === depotWarehouseId)
            : (tables ?? []);
        return selectedTable ? [selectedTable, ...depotTables.filter(t => t.id !== selectedTable.id)] : depotTables;
    }, [tables, selectedTable, depotWarehouseId]);

    const enrichedBundles = useMemo(() => {
        return (bundles ?? []).map(bundle => ({
            ...bundle,
            items: bundle.items.map(item => ({
                ...item,
                product: products?.find(p => p.id === item.productId),
            })),
        }));
    }, [bundles, products]);

    return {
        products,
        isLoadingProducts,
        bundles,
        isLoadingBundles,
        tables,
        isLoadingTables,
        warehouses,
        orders,
        isLoadingOrders,
        depotWarehouseId,
        enrichedBundles,
        displayTables,
    };
}
