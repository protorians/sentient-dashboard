"use client"

import React, {useState, useRef, useCallback, useEffect} from "react";
import {useQueryClient, useQuery} from "@tanstack/react-query";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {CustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {OrderInterface, UpdateOrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {OrderItemInterface} from "@/modules/beverage-sales/domain/order-item.interface";
import {OrderBundleInterface} from "@/modules/beverage-sales/domain/order-bundle.interface";
import {useCart} from "@/modules/beverage-sales/presentation/hooks/use-cart";
import {useBeverageSalesQueries} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-queries";
import {useBeverageSalesMutations} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-mutations";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {SaleTypeSelector} from "@/modules/beverage-sales/presentation/components/sale-type-selector";
import {TableSelector} from "@/modules/beverage-sales/presentation/components/table-selector";
import {CatalogTabs} from "@/modules/beverage-sales/presentation/components/catalog-tabs";
import {CartPanel} from "@/modules/beverage-sales/presentation/components/cart-panel";
import {OrdersList} from "@/modules/beverage-sales/presentation/components/orders-list";
import {CustomerCombobox} from "@/modules/beverage-sales/presentation/components/customer-combobox";
import {TableCreateDialog} from "@/modules/beverage-sales/presentation/components/table-create-dialog";
import {Card} from "@/core/presentation/ui/card";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {DepotSetupDialog} from "@/modules/beverage-sales/presentation/components/depot-setup-dialog";
import {CustomerApiService} from "@/modules/customer/application/service/customer-api-service";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {PaymentMethodInterface} from "@/modules/beverage-sales/domain/payment-method.interface";
import {toast} from "sonner";
import {generateTableLabel, generateTableNumber} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

export default function PosView() {
    const queryClient = useQueryClient();
    const [catalogTab, setCatalogTab] = useState<'products' | 'bundles'>('products');
    const [selectedTable, setSelectedTable] = useState<PosTableInterface | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerInterface | null>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [saleType, setSaleType] = useState<OrderTypeEnum>(OrderTypeEnum.DETAIL);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [tableCreateOpen, setTableCreateOpen] = useState(false);
    const [activeOrder, setActiveOrder] = useState<OrderInterface | null>(null);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);

    const cart = useCart();

    const {
        products,
        isLoadingProducts,
        enrichedBundles,
        isLoadingBundles,
        tables,
        isLoadingTables,
        warehouses,
        orders,
        isLoadingOrders,
        displayTables,
    } = useBeverageSalesQueries(selectedTable);

    const {
        createOrderMutation,
        updateOrderStatusMutation,
        deleteOrderMutation,
        updateOrderMutation,
        createTableMutation,
        depotWarehouseId,
    } = useBeverageSalesMutations(warehouses);

    const {data: paymentMethods, isLoading: isLoadingPaymentMethods} = useQuery<PaymentMethodInterface[]>({
        queryKey: ['billing', 'payment-methods'],
        queryFn: async () => {
            const response = await BillingApiService.getPaymentMethods();
            return response.data?.data ?? [];
        },
    });

    const handleAddPaymentMethod = useCallback(async (name: string, type: string) => {
        await BillingApiService.addPaymentMethod({name, type});
        await queryClient.invalidateQueries({queryKey: ['billing', 'payment-methods']});
        toast.success(`Moyen de paiement "${name}" ajouté`);
    }, [queryClient]);

    const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSyncingRef = useRef(false);
    const skipSyncRef = useRef(false);
    const orderInitialCustomerIdRef = useRef<string | null | undefined>(undefined);
    const orderInitialTableIdRef = useRef<string | null | undefined>(undefined);

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

    const syncOrderToBackend = useCallback(() => {
        if (skipSyncRef.current) return;
        if (!activeOrder || activeOrder.status !== OrderStatusEnum.PENDING) return;
        if (isSyncingRef.current) return;

        const customerId = selectedCustomer?.id ??
            (customerName.trim() ? null : (orderInitialCustomerIdRef.current ? null : undefined));
        const customer = (!selectedCustomer && customerName.trim())
            ? {name: customerName.trim()}
            : (orderInitialCustomerIdRef.current && !selectedCustomer && !customerName.trim())
                ? null
                : undefined;
        const tableId = selectedTable?.id ??
            (orderInitialTableIdRef.current ? null : undefined);

        isSyncingRef.current = true;
        updateOrderMutation.mutate(
            {
                id: activeOrder.id,
                payload: {
                    orderType: saleType,
                    customerId,
                    tableId,
                    customer,
                    items: cart.items.length > 0 ? cart.items : undefined,
                    bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({bundleId: line.bundleId, quantity: line.quantity})) : undefined,
                }
            },
            {
                onSuccess: (response: any) => {
                    const updatedOrder = response?.data?.data as OrderInterface | undefined;
                    if (updatedOrder?.customerId && !selectedCustomer) {
                        handleCustomerCreated(updatedOrder.customerId);
                    }
                },
                onSettled: () => { isSyncingRef.current = false; }
            }
        );
    }, [activeOrder, saleType, selectedCustomer, selectedTable, customerName, cart.items, cart.bundleLines, updateOrderMutation.mutate, handleCustomerCreated]);

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

    const buildSyncPayload = useCallback(() => {
        const customerId = selectedCustomer?.id ??
            (customerName.trim() ? null : (orderInitialCustomerIdRef.current ? null : undefined));
        const customer = (!selectedCustomer && customerName.trim())
            ? {name: customerName.trim()}
            : (orderInitialCustomerIdRef.current && !selectedCustomer && !customerName.trim())
                ? null
                : undefined;
        const tableId = selectedTable?.id ??
            (orderInitialTableIdRef.current ? null : undefined);
        return { customerId, tableId, customer };
    }, [selectedCustomer, selectedTable, customerName]);

    const handleCheckout = async (amountGiven: number, paymentMethodId: string) => {
        try {
            let order = activeOrder;
            const basePayload = buildSyncPayload();

            if (!order) {
                const draftResponse = await createOrderMutation.mutateAsync({
                    warehouseType: WarehouseTypeEnum.DEPOT,
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
                    items: cart.items.length > 0 ? cart.items : undefined,
                    bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({bundleId: line.bundleId, quantity: line.quantity})) : undefined,
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

            cart.clearCart();
            setActiveOrder(null);
            setSelectedTable(null);
            setSelectedCustomer(null);
            setCustomerName("");
            orderInitialCustomerIdRef.current = undefined;
            orderInitialTableIdRef.current = undefined;
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
                        items: cart.items.length > 0 ? cart.items : undefined,
                        bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({bundleId: line.bundleId, quantity: line.quantity})) : undefined,
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
                warehouseType: WarehouseTypeEnum.DEPOT,
                orderType: saleType,
            });
            const newOrder = response.data?.data;
            if (newOrder) {
                setActiveOrder(newOrder);
            }
            await queryClient.invalidateQueries({queryKey: ['beverage-sales', 'orders']});
        } catch {
            return;
        }

        cart.clearCart();
        setSelectedTable(null);
        setSelectedCustomer(null);
        setCustomerName("");
        orderInitialCustomerIdRef.current = undefined;
        orderInitialTableIdRef.current = undefined;
    };

    const flushPendingSync = useCallback(async () => {
        if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
            syncTimerRef.current = null;
        }
        if (!activeOrder || activeOrder.status !== OrderStatusEnum.PENDING) return;
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;
        try {
            const customerId = selectedCustomer?.id ??
                (customerName.trim() ? null : (orderInitialCustomerIdRef.current ? null : undefined));
            const customer = (!selectedCustomer && customerName.trim())
                ? {name: customerName.trim()}
                : (orderInitialCustomerIdRef.current && !selectedCustomer && !customerName.trim())
                    ? null
                    : undefined;
            const tableId = selectedTable?.id ??
                (orderInitialTableIdRef.current ? null : undefined);

            await updateOrderMutation.mutateAsync({
                id: activeOrder.id,
                payload: {
                    orderType: saleType,
                    customerId,
                    tableId,
                    customer,
                    items: cart.items.length > 0 ? cart.items : undefined,
                    bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({bundleId: line.bundleId, quantity: line.quantity})) : undefined,
                }
            });
        } catch {
            toast.error("Impossible de sauvegarder la commande avant de changer");
        } finally {
            isSyncingRef.current = false;
        }
    }, [activeOrder, saleType, selectedCustomer, selectedTable, customerName, cart.items, cart.bundleLines, updateOrderMutation.mutateAsync]);

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
                updateOrderMutation.mutate({ id: activeOrder.id, payload: { tableId: created.id } });
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

    const isSubmitting = createOrderMutation.isPending || updateOrderMutation.isPending || updateOrderStatusMutation.isPending;
    const showDepotSetup = warehouses !== undefined && !depotWarehouseId;

    if (showDepotSetup) {
        return (
            <>
                <DepotSetupDialog show={true} />
                <div className="flex items-center justify-center min-h-[60vh] bg-muted/20">
                    <div className="text-center">
                        <WaitingActivity size={40} />
                        <p className="text-muted-foreground text-sm mt-4">Initialisation du module...</p>
                    </div>
                </div>
            </>
        );
    }

    const isReadOnly = activeOrder?.status === OrderStatusEnum.PAID;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 flex flex-col gap-6">
                <OrdersList
                    orders={orders}
                    isLoading={isLoadingOrders}
                    activeOrder={activeOrder}
                    onSelectOrder={handleSelectOrder}
                    onCreatePending={handleCreatePendingOrder}
                    isCreatingPending={updateOrderMutation.isPending || createOrderMutation.isPending}
                    onMarkPaid={(id) => updateOrderStatusMutation.mutate({id, status: OrderStatusEnum.PAID})}
                    onCancelOrder={(id) => updateOrderStatusMutation.mutate({id, status: OrderStatusEnum.CANCELLED})}
                    onDelete={(id) => deleteOrderMutation.mutate(id)}
                    onSaveOrder={handleSaveOrder}
                    isSaving={updateOrderMutation.isPending}
                    products={products}
                    bundles={enrichedBundles}
                />

                <CatalogTabs
                    tab={catalogTab}
                    onTabChange={setCatalogTab}
                    products={products}
                    isLoadingProducts={isLoadingProducts}
                    bundles={enrichedBundles}
                    isLoadingBundles={isLoadingBundles}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    cartItems={cart.items}
                    onAddToCart={cart.addToCart}
                    onUpdateItemQty={cart.updateItemQty}
                    onAddBundleToCart={cart.addBundleToCart}
                    isReadOnly={isReadOnly}
                />
            </div>

            <div className="flex flex-col gap-6">
                <Card className="p-5 border-none shadow-sm flex flex-col gap-4">
                    <h3 className="text-lg font-bold">Informations client</h3>
                    <CustomerCombobox
                        customer={selectedCustomer}
                        onSelect={setSelectedCustomer}
                        onNameChange={setCustomerName}
                    />
                    <TableSelector
                        tables={displayTables ?? []}
                        selectedTable={selectedTable}
                        isLoading={isLoadingTables}
                        onSelect={setSelectedTable}
                        onCreateClick={() => setTableCreateOpen(true)}
                    />
                </Card>

                <TableCreateDialog
                    open={tableCreateOpen}
                    onOpenChange={setTableCreateOpen}
                    defaultLabel={generateTableLabel(displayTables ?? [])}
                    defaultNumber={generateTableNumber(displayTables ?? [])}
                    onSave={handleCreateTable}
                    isSaving={createTableMutation.isPending}
                />

                <CartPanel
                    products={products}
                    bundles={enrichedBundles}
                    items={cart.items}
                    bundleLines={cart.bundleLines}
                    customer={selectedCustomer}
                    customerName={customerName}
                    table={selectedTable}
                    saleType={saleType}
                    activeOrder={activeOrder}
                    onUpdateItemQty={cart.updateItemQty}
                    onUpdateItemUnit={cart.updateItemUnit}
                    onRemoveItem={cart.removeFromCart}
                    onUpdateBundleQty={cart.updateBundleQty}
                    onRemoveBundle={cart.removeBundleFromCart}
                    onClearCart={() => {
                        cart.clearCart();
                        setActiveOrder(null);
                        orderInitialCustomerIdRef.current = undefined;
                        orderInitialTableIdRef.current = undefined;
                    }}
                    onCheckout={handleCheckout}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}
