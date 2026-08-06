"use client"

import React, {useState} from "react";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {BundleTypeEnum} from "@/modules/beverage-sales/domain/enums/bundle-type.enum";
import {CustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";
import {PosTableInterface} from "@/modules/beverage-sales/domain/pos-table.interface";
import {OrderInterface, UpdateOrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {CreateBundleItemInterface} from "@/modules/beverage-sales/domain/bundle-item.interface";
import {useCart} from "@/modules/beverage-sales/presentation/hooks/use-cart";
import {useBeverageSalesQueries} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-queries";
import {useBeverageSalesMutations} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-mutations";
import {SaleTypeSelector} from "@/modules/beverage-sales/presentation/components/sale-type-selector";
import {TableSelector} from "@/modules/beverage-sales/presentation/components/table-selector";
import {CatalogTabs} from "@/modules/beverage-sales/presentation/components/catalog-tabs";
import {CartPanel} from "@/modules/beverage-sales/presentation/components/cart-panel";
import {BundleManager} from "@/modules/beverage-sales/presentation/components/bundle-manager";
import {CustomerCombobox} from "@/modules/beverage-sales/presentation/components/customer-combobox";
import {TableCreateDialog} from "@/modules/beverage-sales/presentation/components/table-create-dialog";
import {Card} from "@/core/presentation/ui/card";
import {Tabs, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";
import {WineIcon, ShoppingBagIcon, GiftIcon, UserIcon, WarehouseIcon, ArrowLeftIcon} from "lucide-react";
import {toast} from "sonner";
import {generateTableLabel, generateTableNumber} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";
import { Button } from "@/core/presentation/ui/button";
import {useRouter} from "next/navigation";

export default function BeverageSalesView() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'caisse' | 'bundles'>('caisse');
    const [catalogTab, setCatalogTab] = useState<'products' | 'bundles' | 'orders'>('products');
    const [selectedTable, setSelectedTable] = useState<PosTableInterface | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerInterface | null>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [saleType, setSaleType] = useState<OrderTypeEnum>(OrderTypeEnum.DETAIL);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [tableCreateOpen, setTableCreateOpen] = useState(false);

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
        saveBundleMutation,
        deleteBundleMutation,
        createTableMutation,
        depotWarehouseId,
    } = useBeverageSalesMutations(warehouses);

    const handleCheckout = () => {
        createOrderMutation.mutate({
            warehouseType: WarehouseTypeEnum.DEPOT,
            orderType: saleType,
            customerId: selectedCustomer?.id,
            tableId: selectedTable?.id,
            customer: (!selectedCustomer && customerName.trim())
                ? {name: customerName.trim()}
                : undefined,
            items: cart.items.length > 0 ? cart.items : undefined,
            bundles: cart.bundleLines.length > 0 ? cart.bundleLines.map(line => ({bundleId: line.bundleId, quantity: line.quantity})) : undefined,
        }, {
            onSuccess: () => {
                cart.clearCart();
                setSelectedTable(null);
                setSelectedCustomer(null);
                setCustomerName("");
            }
        });
    };

    const handleCreateTable = async (payload: { label: string; number?: number }) => {
        const fullPayload = {label: payload.label, number: payload.number, warehouseId: depotWarehouseId ?? ''};
        const response = await createTableMutation.mutateAsync(fullPayload);
        const created = response.data?.data;
        if (created) setSelectedTable(created);
        setTableCreateOpen(false);
        toast.success(`Table « ${payload.label} » créée`);
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

    const handleSaveOrder = (order: OrderInterface, payload: UpdateOrderInterface) => {
        updateOrderMutation.mutate({id: order.id, payload});
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 bg-muted/20 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="">
                        <Button onClick={() => router.back()} variant="outline" size="lg" >
                            <ArrowLeftIcon/>
                            Quitter
                        </Button>
                    </div>
                    <div className="bg-primary/10 p-2.5 rounded-xl">
                        <WineIcon className="size-6 text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Vente de Boissons</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                            <WarehouseIcon className="size-3.5"/>
                            Caisse dédiée au dépôt ({WarehouseTypeEnum.DEPOT}) · gros, semi-gros et détail
                        </p>
                    </div>
                </div>

                <SaleTypeSelector value={saleType} onChange={setSaleType}/>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'caisse' | 'bundles')} className="w-full">
                <div className="flex items-center justify-center gap-2">
                    <TabsList>
                        <TabsTrigger value="caisse">
                            <ShoppingBagIcon data-icon="inline-start"/>
                            Caisse
                        </TabsTrigger>
                        <TabsTrigger value="bundles">
                            <GiftIcon data-icon="inline-start"/>
                            Kits
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            {activeTab === 'caisse' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4 border-none shadow-sm flex flex-col gap-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <UserIcon className="size-4 text-primary"/>
                                    Client
                                </h3>
                                <CustomerCombobox
                                    customer={selectedCustomer}
                                    onSelect={setSelectedCustomer}
                                    onNameChange={setCustomerName}
                                />
                            </Card>

                            <TableSelector
                                tables={displayTables ?? []}
                                selectedTable={selectedTable}
                                isLoading={isLoadingTables}
                                onSelect={setSelectedTable}
                                onCreateClick={() => setTableCreateOpen(true)}
                            />
                        </div>

                        <TableCreateDialog
                            open={tableCreateOpen}
                            onOpenChange={setTableCreateOpen}
                            defaultLabel={generateTableLabel(displayTables ?? [])}
                            defaultNumber={generateTableNumber(displayTables ?? [])}
                            onSave={handleCreateTable}
                            isSaving={createTableMutation.isPending}
                        />

                        <CatalogTabs
                            tab={catalogTab}
                            onTabChange={setCatalogTab}
                            products={products}
                            isLoadingProducts={isLoadingProducts}
                            bundles={enrichedBundles}
                            isLoadingBundles={isLoadingBundles}
                            orders={orders}
                            isLoadingOrders={isLoadingOrders}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onAddToCart={cart.addToCart}
                            onAddBundleToCart={cart.addBundleToCart}
                            onManageBundles={() => setActiveTab('bundles')}
                            isSaving={updateOrderMutation.isPending}
                            onMarkPaid={(id) => updateOrderStatusMutation.mutate({id, status: OrderStatusEnum.PAID})}
                            onCancel={(id) => updateOrderStatusMutation.mutate({id, status: OrderStatusEnum.CANCELLED})}
                            onDelete={(id) => deleteOrderMutation.mutate(id)}
                            onSaveOrder={handleSaveOrder}
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <CartPanel
                            products={products}
                            bundles={enrichedBundles}
                            items={cart.items}
                            bundleLines={cart.bundleLines}
                            customer={selectedCustomer}
                            customerName={customerName}
                            table={selectedTable}
                            saleType={saleType}
                            onUpdateItemQty={cart.updateItemQty}
                            onUpdateItemUnit={cart.updateItemUnit}
                            onRemoveItem={cart.removeFromCart}
                            onUpdateBundleQty={cart.updateBundleQty}
                            onRemoveBundle={cart.removeBundleFromCart}
                            onClearCart={cart.clearCart}
                            onCheckout={handleCheckout}
                            isSubmitting={createOrderMutation.isPending}
                        />
                    </div>
                </div>
            ) : (
                <BundleManager
                    bundles={enrichedBundles}
                    isLoading={isLoadingBundles}
                    products={products}
                    isLoadingProducts={isLoadingProducts}
                    isSaving={saveBundleMutation.isPending}
                    onSave={handleSaveBundle}
                    onDelete={handleDeleteBundle}
                />
            )}
        </div>
    );
}
