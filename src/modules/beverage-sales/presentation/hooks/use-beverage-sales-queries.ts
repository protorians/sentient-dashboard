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
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";

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

export function useBeverageSalesQueries(selectedTable: PosTableInterface | null, bundleSearch?: string, orderStatus: OrderStatusEnum | null = OrderStatusEnum.PENDING): UseBeverageSalesQueriesReturn {
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

    const {data: products, isLoading: isLoadingProducts} = useQuery<ProductInterface[]>({
        queryKey: ['pos', 'products', depotWarehouseId],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getPosProducts(depotWarehouseId);
            const posProducts = response.data?.data;
            if (posProducts && posProducts.length > 0) return posProducts;
            const stockResponse = await StockApiService.getAll();
            return stockResponse.data?.data || [];
        },
        enabled: !!depotWarehouseId,
        staleTime: 10_000,
        refetchInterval: 15_000,
    });

    const {data: bundles, isLoading: isLoadingBundles} = useQuery<BundleInterface[]>({
        queryKey: ['beverage-sales', 'bundles', bundleSearch ?? ''],
        queryFn: async () => {
            const filters: Record<string, any> = {page: 1, limit: 100};
            if (bundleSearch?.trim()) filters.search = bundleSearch.trim();
            const response = await BeverageSalesApiService.getBundles(filters);
            return response.data?.data?.data || [];
        }
    });

    const {data: tables, isLoading: isLoadingTables} = useQuery<PosTableInterface[]>({
        queryKey: ['beverage-sales', 'tables', depotWarehouseId],
        queryFn: async () => {
            const response = await BeverageSalesApiService.getTables(depotWarehouseId);
            return response.data?.data || [];
        },
        enabled: !!depotWarehouseId,
    });

    const {data: orders, isLoading: isLoadingOrders} = useQuery<OrderInterface[]>({
        queryKey: ['beverage-sales', 'orders', orderStatus],
        queryFn: async () => {
            const filters: Record<string, any> = {warehouseType: WarehouseTypeEnum.BEVERAGE_DEPOT, limit: 50};
            if (orderStatus) filters.status = orderStatus;
            const response = await BeverageSalesApiService.getOrders(filters);
            return response.data?.data || [];
        }
    });

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
