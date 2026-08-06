"use client"

import React from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {OrderInterface, UpdateOrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {CartItemLine, CartBundleLine} from "@/modules/beverage-sales/domain/cart.types";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";
import {EnrichedBundle} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-queries";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/core/presentation/ui/tabs";
import {Button} from "@/core/presentation/ui/button";
import {ProductCatalog} from "@/modules/beverage-sales/presentation/components/product-catalog";
import {BundleCatalog} from "@/modules/beverage-sales/presentation/components/bundle-catalog";
import {RecentOrders} from "@/modules/beverage-sales/presentation/components/recent-orders";
import {WineIcon, GiftIcon, ShoppingBagIcon, LayersIcon} from "lucide-react";

interface CatalogTabsProps {
    tab: 'products' | 'bundles' | 'orders';
    onTabChange: (tab: 'products' | 'bundles' | 'orders') => void;
    products?: ProductInterface[];
    isLoadingProducts: boolean;
    bundles?: EnrichedBundle[];
    isLoadingBundles: boolean;
    orders?: OrderInterface[];
    isLoadingOrders: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddToCart: (product: ProductInterface, unit: MovementUnitEnum, unitPrice: number) => void;
    onAddBundleToCart: (bundle: EnrichedBundle, unitPrice: number) => void;
    onManageBundles: () => void;
    isSaving: boolean;
    onMarkPaid: (id: string) => void;
    onCancel: (id: string) => void;
    onDelete: (id: string) => void;
    onSaveOrder: (order: OrderInterface, payload: UpdateOrderInterface) => void;
}

export function CatalogTabs({
    tab,
    onTabChange,
    products,
    isLoadingProducts,
    bundles,
    isLoadingBundles,
    orders,
    isLoadingOrders,
    searchTerm,
    onSearchChange,
    onAddToCart,
    onAddBundleToCart,
    onManageBundles,
    isSaving,
    onMarkPaid,
    onCancel,
    onDelete,
    onSaveOrder,
}: CatalogTabsProps) {
    return (
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as 'products' | 'bundles' | 'orders')} className="w-full">
            <div className="flex items-center justify-between gap-2 mb-4">
                <TabsList>
                    <TabsTrigger value="products">
                        <WineIcon data-icon="inline-start"/>
                        Produits
                    </TabsTrigger>
                    <TabsTrigger value="bundles">
                        <GiftIcon data-icon="inline-start"/>
                        Kits
                    </TabsTrigger>
                    <TabsTrigger value="orders">
                        <ShoppingBagIcon data-icon="inline-start"/>
                        Récentes
                    </TabsTrigger>
                </TabsList>
                {tab === 'bundles' && (
                    <Button variant="outline" size="sm" onClick={onManageBundles}>
                        <LayersIcon className="size-4"/>
                        Gérer les bundles
                    </Button>
                )}
            </div>
            <TabsContent value="products" className="flex flex-col">
                <ProductCatalog
                    products={products}
                    isLoading={isLoadingProducts}
                    searchTerm={searchTerm}
                    onSearchChange={onSearchChange}
                    onAdd={onAddToCart}
                />
            </TabsContent>
            <TabsContent value="bundles" className="flex flex-col">
                <BundleCatalog
                    bundles={bundles}
                    isLoading={isLoadingBundles}
                    onAdd={onAddBundleToCart}
                />
            </TabsContent>
            <TabsContent value="orders" className="flex flex-col">
                <RecentOrders
                    orders={orders}
                    isLoading={isLoadingOrders}
                    products={products}
                    bundles={bundles}
                    isSaving={isSaving}
                    onMarkPaid={onMarkPaid}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    onSaveOrder={onSaveOrder}
                />
            </TabsContent>
        </Tabs>
    );
}
