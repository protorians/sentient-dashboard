"use client"

import {useState, useRef, useCallback, useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {BundleTypeEnum} from "@/modules/beverage-sales/domain/enums/bundle-type.enum";
import {CustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {OrderInterface, UpdateOrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {OrderItemInterface} from "@/modules/beverage-sales/domain/order-item.interface";
import {OrderBundleInterface} from "@/modules/beverage-sales/domain/order-bundle.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {CreateBundleItemInterface} from "@/modules/beverage-sales/domain/bundle-item.interface";
import {useCart} from "@/modules/beverage-sales/presentation/hooks/use-cart";
import {useBeverageSalesQueries} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-queries";
import {useBeverageSalesMutations} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-mutations";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {CustomerApiService} from "@/modules/customer/application/service/customer-api-service";
import {toast} from "sonner";
import {filterInStockItems} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

export interface UsePosWorkflowOptions {
    bundleSearch?: string;
}

export interface SyncOrderPayload {
    customerId?: string | null;
    tableId?: string | null;
    customer?: {name: string} | null;
}

export function usePosWorkflow(options: UsePosWorkflowOptions = {}) {
    const {bundleSearch} = options;
    const queryClient = useQueryClient();

    const [catalogTab, setCatalogTab] = useState<'products' | 'bundles'>('products');
    const [selectedTable, setSelectedTable] = useState<PosTableInterface | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerInterface | null>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [saleType, setSaleType] = useState<OrderTypeEnum>(OrderTypeEnum.DETAIL);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [tableCreateOpen, setTableCreateOpen] = useState(false);
    const [activeOrder, setActiveOrder] = useState<OrderInterface | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatusEnum | null>(OrderStatusEnum.PENDING);

    const cart = useCart();

    const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSyncingRef = useRef(false);
    const skipSyncRef = useRef(false);
    const orderInitialCustomerIdRef = useRef<string | null | undefined>(undefined);
    const orderInitialTableIdRef = useRef<string | null | undefined>(undefined);

    useEffect(() => {
        if (!cart.orderId || activeOrder) return;
        let cancelled = false;
        BeverageSalesApiService.getOrder(cart.orderId).then(response => {
            if (cancelled) return;
            const fullOrder = response.data?.data;
            if (fullOrder && fullOrder.status === OrderStatusEnum.PENDING) {
                setActiveOrder(fullOrder);
                setSaleType(fullOrder.orderType);
                if (fullOrder.table) setSelectedTable(fullOrder.table as PosTableInterface);
                if (fullOrder.customer) {
                    setSelectedCustomer(fullOrder.customer as CustomerInterface);
                    setCustomerName([fullOrder.customer.firstname, fullOrder.customer.lastname].filter(Boolean).join(' ') || fullOrder.customer.companyName || '');
                }
                orderInitialCustomerIdRef.current = fullOrder.customerId ?? null;
                orderInitialTableIdRef.current = fullOrder.tableId ?? null;
            } else {
                cart.clearCart();
            }
        }).catch(() => {
            cart.clearCart();
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart.orderId]);

    const {
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
    } = useBeverageSalesQueries(selectedTable, bundleSearch, orderStatus);

    const {
        createOrderMutation,
        updateOrderStatusMutation,
        deleteOrderMutation,
        updateOrderMutation,
        saveBundleMutation,
        deleteBundleMutation,
        createTableMutation,
    } = useBeverageSalesMutations(warehouses);

    useEffect(() => {
        if (!activeOrder || activeOrder.status !== OrderStatusEnum.PENDING) return;
        if (!products || products.length === 0) return;
        cart.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const stock = product?.stockQuantity ?? product?.stock?.quantity;
            if (typeof stock === 'number' && stock >= 0 && item.quantity > stock) {
                cart.updateItemQty(item.productId, Math.max(0, stock));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products, activeOrder]);

    const handleCustomerCreated = useCallback(async (customerId: string) => {
        if (selectedCustomer?.id === customerId) return;
        try {
            const customerResponse = await CustomerApiService.getById(customerId);
            const customer = customerResponse.data?.data;
            if (customer) {
                setSelectedCustomer(customer);
                setCustomerName([customer.firstname, customer.lastname].filter(Boolean).join(' '));
                orderInitialCustomerIdRef.current = customerId;
            }
        } catch {
        }
    }, [selectedCustomer?.id]);

    const buildSyncPayload = useCallback((): SyncOrderPayload => {
        const customerId = selectedCustomer?.id ??
            (customerName.trim() ? null : (orderInitialCustomerIdRef.current ? null : undefined));
        const customer = (!selectedCustomer && customerName.trim())
            ? {name: customerName.trim()}
            : (orderInitialCustomerIdRef.current && !selectedCustomer && !customerName.trim())
                ? null
                : undefined;
        const tableId = selectedTable?.id ??
            (orderInitialTableIdRef.current ? null : undefined);
        return {customerId, tableId, customer};
    }, [selectedCustomer, selectedTable, customerName]);

    const syncOrderToBackend = useCallback(() => {
        if (skipSyncRef.current) return;
        if (!activeOrder || activeOrder.status !== OrderStatusEnum.PENDING) return;
        if (isSyncingRef.current) return;

        const {customerId, tableId, customer} = buildSyncPayload();

        isSyncingRef.current = true;
        const syncItems = (() => {
            const filtered = filterInStockItems(cart.items, products);
            return filtered.length > 0 ? filtered : undefined;
        })();
        updateOrderMutation.mutate(
            {
                id: activeOrder.id,
                payload: {
                    orderType: saleType,
                    customerId,
                    tableId,
                    customer,
                    items: syncItems,
                    bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({
                        bundleId: line.bundleId,
                        quantity: line.quantity
                    })) : undefined,
                }
            },
            {
                onSuccess: (response: any) => {
                    const updatedOrder = response?.data?.data as OrderInterface | undefined;
                    if (updatedOrder?.customerId && !selectedCustomer) {
                        handleCustomerCreated(updatedOrder.customerId);
                    }
                },
                onSettled: () => {
                    isSyncingRef.current = false;
                }
            }
        );
    }, [activeOrder, saleType, selectedCustomer, buildSyncPayload, cart.items, cart.bundleLines, updateOrderMutation.mutate, handleCustomerCreated, products]);

    useEffect(() => {
        if (!activeOrder || activeOrder.status !== OrderStatusEnum.PENDING) return;
        if (skipSyncRef.current) return;

        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => {
            syncOrderToBackend();
        }, 400);

        return () => {
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        };
    }, [cart.items, cart.bundleLines, selectedCustomer, selectedTable, customerName, saleType, syncOrderToBackend]);

    const flushPendingSync = useCallback(async () => {
        if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
            syncTimerRef.current = null;
        }
        if (!activeOrder || activeOrder.status !== OrderStatusEnum.PENDING) return;
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;
        try {
            const {customerId, tableId, customer} = buildSyncPayload();
            const syncItems = (() => {
                const filtered = filterInStockItems(cart.items, products);
                return filtered.length > 0 ? filtered : undefined;
            })();

            await updateOrderMutation.mutateAsync({
                id: activeOrder.id,
                payload: {
                    orderType: saleType,
                    customerId,
                    tableId,
                    customer,
                    items: syncItems,
                    bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({
                        bundleId: line.bundleId,
                        quantity: line.quantity
                    })) : undefined,
                }
            });
        } catch {
            toast.error("Impossible de sauvegarder la commande avant de changer");
        } finally {
            isSyncingRef.current = false;
        }
    }, [activeOrder, saleType, buildSyncPayload, cart.items, cart.bundleLines, updateOrderMutation.mutateAsync, products]);

    const handleCheckout = async (amountGiven: number) => {
        try {
            let order = activeOrder;
            const basePayload = buildSyncPayload();

            if (!order) {
                const draftResponse = await createOrderMutation.mutateAsync({
                    warehouseType: WarehouseTypeEnum.BEVERAGE_DEPOT,
                    orderType: saleType,
                    ...basePayload,
                });
                order = draftResponse.data?.data;
                if (!order) return;
            }

            const updateResponse = await updateOrderMutation.mutateAsync({
                id: order.id,
                payload: {
                    orderType: saleType,
                    ...basePayload,
                    items: (() => {
                        const filtered = filterInStockItems(cart.items, products);
                        return filtered.length > 0 ? filtered : undefined;
                    })(),
                    bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({
                        bundleId: line.bundleId,
                        quantity: line.quantity
                    })) : undefined,
                    receivedAmount: amountGiven > 0 ? amountGiven : undefined,
                }
            });
            const updatedOrder = updateResponse.data?.data;
            if (updatedOrder?.customerId && !selectedCustomer) {
                await handleCustomerCreated(updatedOrder.customerId);
            }

            await updateOrderStatusMutation.mutateAsync({
                id: order.id,
                status: OrderStatusEnum.PAID
            });

            resetWorkflow();
        } catch {
        }
    };

    const handleCreatePendingOrder = async () => {
        if (activeOrder) {
            const basePayload = buildSyncPayload();
            try {
                const updateResponse = await updateOrderMutation.mutateAsync({
                    id: activeOrder.id,
                    payload: {
                        orderType: saleType,
                        ...basePayload,
                        items: (() => {
                            const filtered = filterInStockItems(cart.items, products);
                            return filtered.length > 0 ? filtered : undefined;
                        })(),
                        bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({
                            bundleId: line.bundleId,
                            quantity: line.quantity
                        })) : undefined,
                    }
                });
                const updatedOrder = updateResponse.data?.data;
                if (updatedOrder?.customerId && !selectedCustomer) {
                    await handleCustomerCreated(updatedOrder.customerId);
                }
                toast.success("Commande sauvegardée");
                await queryClient.invalidateQueries({queryKey: ['beverage-sales', 'orders']});
            } catch {
                return;
            }
        }

        try {
            const response = await createOrderMutation.mutateAsync({
                warehouseType: WarehouseTypeEnum.BEVERAGE_DEPOT,
                orderType: saleType,
            });
            const newOrder = response.data?.data;
            if (newOrder) {
                setActiveOrder(newOrder);
                cart.clearCart();
                cart.setOrderId(newOrder.id);
            }
            await queryClient.invalidateQueries({queryKey: ['beverage-sales', 'orders']});
        } catch {
            return;
        }

        setSelectedTable(null);
        setSelectedCustomer(null);
        setCustomerName("");
        orderInitialCustomerIdRef.current = undefined;
        orderInitialTableIdRef.current = undefined;
    };

    const handleSelectOrder = async (order: OrderInterface) => {
        try {
            if (activeOrder && activeOrder.status === OrderStatusEnum.PENDING) {
                await flushPendingSync();
            }
            skipSyncRef.current = true;

            const detailResponse = await BeverageSalesApiService.getOrder(order.id);
            const fullOrder = detailResponse.data?.data ?? order;

            setActiveOrder(fullOrder);
            setSaleType(fullOrder.orderType);

            if (fullOrder.table) {
                setSelectedTable(fullOrder.table as PosTableInterface);
            } else if (fullOrder.tableId) {
                try {
                    const tableResponse = await BeverageSalesApiService.getTable(fullOrder.tableId);
                    setSelectedTable(tableResponse.data?.data ?? null);
                } catch {
                    setSelectedTable(null);
                }
            } else {
                setSelectedTable(null);
            }

            if (fullOrder.customer) {
                setSelectedCustomer(fullOrder.customer as CustomerInterface);
                setCustomerName([fullOrder.customer.firstname, fullOrder.customer.lastname].filter(Boolean).join(' ') || fullOrder.customer.companyName || '');
            } else if (fullOrder.customerId) {
                try {
                    const customerResponse = await CustomerApiService.getById(fullOrder.customerId);
                    const customer = customerResponse.data?.data;
                    if (customer) {
                        setSelectedCustomer(customer);
                        setCustomerName([customer.firstname, customer.lastname].filter(Boolean).join(' '));
                    } else {
                        setSelectedCustomer(null);
                        setCustomerName("");
                    }
                } catch {
                    setSelectedCustomer(null);
                    setCustomerName("");
                }
            } else {
                setSelectedCustomer(null);
                setCustomerName("");
            }

            orderInitialCustomerIdRef.current = fullOrder.customerId ?? null;
            orderInitialTableIdRef.current = fullOrder.tableId ?? null;

            cart.loadFromOrder(
                fullOrder.id,
                fullOrder.items.map((item: OrderItemInterface) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: item.unitPrice,
                })),
                fullOrder.bundles.map((bundle: OrderBundleInterface) => ({
                    bundleId: bundle.bundleId,
                    quantity: bundle.quantity,
                    unitPrice: bundle.unitPrice,
                }))
            );

            await queryClient.invalidateQueries({queryKey: ['beverage-sales', 'orders']});

            setTimeout(() => {
                skipSyncRef.current = false;
            }, 600);
        } catch {
            skipSyncRef.current = false;
            toast.error("Impossible de charger la commande.");
        }
    };

    const handleCreateTable = async (payload: { label: string; number?: number }) => {
        const fullPayload = {label: payload.label, number: payload.number, warehouseId: depotWarehouseId ?? ''};
        const response = await createTableMutation.mutateAsync(fullPayload);
        const created = response.data?.data;
        if (created) {
            setSelectedTable(created);
            await queryClient.invalidateQueries({queryKey: ['beverage-sales', 'tables']});
            if (activeOrder) {
                updateOrderMutation.mutate({id: activeOrder.id, payload: {tableId: created.id}});
                setActiveOrder(prev => prev ? {...prev, tableId: created.id} : null);
            }
        }
        setTableCreateOpen(false);
        toast.success(`Table « ${payload.label} » créée`);
    };

    const handleSaveOrder = (order: OrderInterface, payload: UpdateOrderInterface) => {
        updateOrderMutation.mutate(
            {id: order.id, payload},
            {onSuccess: () => toast.success("Commande modifiée avec succès")}
        );
    };

    const handleSaveBundle = async (
        bundle: BundleInterface | null,
        payload: { name: string; sku?: string; description?: string; type: BundleTypeEnum; price?: number; items: CreateBundleItemInterface[] }
    ) => {
        await saveBundleMutation.mutateAsync({bundle, payload});
    };

    const handleDeleteBundle = async (id: string) => {
        await deleteBundleMutation.mutateAsync(id);
    };

    const handleClearCart = () => {
        cart.clearCart();
        setActiveOrder(null);
        orderInitialCustomerIdRef.current = undefined;
        orderInitialTableIdRef.current = undefined;
    };

    const resetWorkflow = () => {
        cart.clearCart();
        setActiveOrder(null);
        setSelectedTable(null);
        setSelectedCustomer(null);
        setCustomerName("");
        orderInitialCustomerIdRef.current = undefined;
        orderInitialTableIdRef.current = undefined;
    };

    const isSubmitting = createOrderMutation.isPending || updateOrderMutation.isPending || updateOrderStatusMutation.isPending;
    const isReadOnly = activeOrder?.status === OrderStatusEnum.PAID;

    return {
        catalogTab,
        setCatalogTab,
        searchTerm,
        setSearchTerm,
        tableCreateOpen,
        setTableCreateOpen,
        orderStatus,
        setOrderStatus,
        saleType,
        setSaleType,
        selectedTable,
        setSelectedTable,
        selectedCustomer,
        setSelectedCustomer,
        customerName,
        setCustomerName,
        activeOrder,
        setActiveOrder,
        cart,
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
        createOrderMutation,
        updateOrderStatusMutation,
        deleteOrderMutation,
        updateOrderMutation,
        saveBundleMutation,
        deleteBundleMutation,
        createTableMutation,
        handleSelectOrder,
        handleCreatePendingOrder,
        handleCheckout,
        handleCreateTable,
        handleSaveOrder,
        handleSaveBundle,
        handleDeleteBundle,
        handleClearCart,
        isSubmitting,
        isReadOnly,
    };
}
