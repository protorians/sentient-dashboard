"use client"

import React, {useState} from "react";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {usePosWorkflow} from "@/modules/beverage-sales/presentation/hooks/use-pos-workflow";
import {SaleTypeSelector} from "@/modules/beverage-sales/presentation/components/sale-type-selector";
import {TableSelector} from "@/modules/beverage-sales/presentation/components/table-selector";
import {CatalogTabs} from "@/modules/beverage-sales/presentation/components/catalog-tabs";
import {CartPanel} from "@/modules/beverage-sales/presentation/components/cart-panel";
import {OrdersList} from "@/modules/beverage-sales/presentation/components/orders-list";
import {BundleManager} from "@/modules/beverage-sales/presentation/components/bundle-manager";
import {CustomerCombobox} from "@/modules/beverage-sales/presentation/components/customer-combobox";
import {TableCreateDialog} from "@/modules/beverage-sales/presentation/components/table-create-dialog";
import {Card} from "@/core/presentation/ui/card";
import {Tabs, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";
import {WineIcon, ShoppingBagIcon, GiftIcon, WarehouseIcon, ArrowLeftIcon} from "lucide-react";
import {generateTableLabel, generateTableNumber} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";
import {Button} from "@/core/presentation/ui/button";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {DepotSetupDialog} from "@/modules/beverage-sales/presentation/components/depot-setup-dialog";
import {useRouter} from "next/navigation";
import {AnimatedContent} from "@/core/presentation/animated-content";

export default function BeverageSalesView() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'caisse' | 'bundles'>('caisse');
    const [bundleSearch, setBundleSearch] = useState<string>("");

    const {
        cart,
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
        products,
        isLoadingProducts,
        enrichedBundles,
        isLoadingBundles,
        displayTables,
        isLoadingTables,
        warehouses,
        orders,
        isLoadingOrders,
        depotWarehouseId,
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
    } = usePosWorkflow({bundleSearch});

    const showDepotSetup = warehouses !== undefined && !depotWarehouseId;

    if (showDepotSetup) {
        return (
            <>
                <DepotSetupDialog show={true} />
                <div className="flex items-center justify-center min-h-screen bg-muted/20">
                    <div className="text-center">
                        <WaitingActivity size={40} />
                        <p className="text-muted-foreground text-sm mt-4">Initialisation du module...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <AnimatedContent variant="enter">
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
                            Caisse dédiée au dépôt ({WarehouseTypeEnum.BEVERAGE_DEPOT}) · gros, semi-gros et détail
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
                            statusFilter={orderStatus}
                            onStatusFilterChange={setOrderStatus}
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
                            onClearCart={handleClearCart}
                            onCheckout={handleCheckout}
                            isSubmitting={isSubmitting}
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
                    onSearchChange={setBundleSearch}
                />
            )}
        </div>
        </AnimatedContent>
    );
}
