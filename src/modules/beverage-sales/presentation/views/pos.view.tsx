"use client"

import React from "react";
import {useQuery} from "@tanstack/react-query";
import {PaymentMethodInterface} from "@/modules/beverage-sales/domain/payment-method.interface";
import {usePosWorkflow} from "@/modules/beverage-sales/presentation/hooks/use-pos-workflow";
import {CatalogTabs} from "@/modules/beverage-sales/presentation/components/catalog-tabs";
import {CartPanel} from "@/modules/beverage-sales/presentation/components/cart-panel";
import {OrdersList} from "@/modules/beverage-sales/presentation/components/orders-list";
import {TableSelector} from "@/modules/beverage-sales/presentation/components/table-selector";
import {CustomerCombobox} from "@/modules/beverage-sales/presentation/components/customer-combobox";
import {TableCreateDialog} from "@/modules/beverage-sales/presentation/components/table-create-dialog";
import {Card} from "@/core/presentation/ui/card";
import {RequireDepotSetup} from "@/modules/beverage-sales/presentation/components/require-depot-setup";
import {AnimatedContent} from "@/core/presentation/animated-content";
import {RegisterStatusBanner} from "@/modules/beverage-sales/presentation/components/register-status-banner";
import {useRegisterStatus} from "@/modules/beverage-sales/presentation/hooks/use-register-status";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {
    generateTableLabel,
    generateTableNumber,
} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";
import {cn} from "@/core/infrastructure/utilities/utils";
import { Button } from "@/core/presentation/ui/button";
import {XCircleIcon, XIcon} from "lucide-react";

export default function PosView() {
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
        orders,
        isLoadingOrders,
        createOrderMutation,
        updateOrderStatusMutation,
        deleteOrderMutation,
        updateOrderMutation,
        createTableMutation,
        handleSelectOrder,
        handleCreatePendingOrder,
        handleCheckout,
        handleCreateTable,
        handleSaveOrder,
        handleClearCart,
        isSubmitting,
        isReadOnly,
    } = usePosWorkflow();

    const {data: paymentMethods, isLoading: isLoadingPaymentMethods} = useQuery<PaymentMethodInterface[]>({
        queryKey: ['billing', 'payment-methods'],
        queryFn: async () => {
            const response = await BillingApiService.getPaymentMethods();
            return response.data?.data?.data ?? [];
        },
    });

    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = React.useState<string | null>(null);

    const {data: registerStatus, isLoading: isLoadingRegisterStatus} = useRegisterStatus();

    return (
        <RequireDepotSetup>
            <AnimatedContent variant="enter" className="flex flex-col gap-6 w-full">
            <RegisterStatusBanner status={registerStatus} isLoading={isLoadingRegisterStatus}/>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start w-full">
            <div className="xl:col-span-2 flex flex-col gap-6">
                <OrdersList
                    orders={orders}
                    isLoading={isLoadingOrders}
                    activeOrder={activeOrder}
                    onSelectOrder={handleSelectOrder}
                    onCreatePending={handleCreatePendingOrder}
                    isCreatingPending={updateOrderMutation.isPending || createOrderMutation.isPending}
                    onMarkPaid={(id) => updateOrderStatusMutation.mutate({
                        id,
                        status: OrderStatusEnum.PAID
                    })}
                    onCancelOrder={(id) => updateOrderStatusMutation.mutate({
                        id,
                        status: OrderStatusEnum.CANCELLED
                    })}
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

            <div className={cn(
                "flex flex-col gap-2",
                "fixed bottom-0 left-0 z-100 p-2",
                "sm:sticky sm:top-20 sm:z-auto",
            )}>
                <div className="flex flex-row justify-end sm:hidden">
                    <div className="flex justify-center items-center rounded-full aspect-square w-12 p-3 bg-foreground/90 text-background backdrop-blur-2xl hover:bg-primary/80 hover:text-primary-foreground cursor-pointer">
                        <XIcon className="size-5"/>
                    </div>
                </div>
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
                    paymentMethods={paymentMethods}
                    isLoadingPaymentMethods={isLoadingPaymentMethods}
                    selectedPaymentMethodId={selectedPaymentMethodId}
                    onPaymentMethodChange={setSelectedPaymentMethodId}
                    registerOpen={registerStatus?.isOpen ?? true}
                />
            </div>
        </div>
        </AnimatedContent>
        </RequireDepotSetup>
    );
}
