"use client"

import React from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {MovementUnitEnum} from "@/modules/beverage-sales/domain/enums/movement-unit.enum";
import {CartItemLine} from "@/modules/beverage-sales/domain/cart.types";
import {EnrichedBundle} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-queries";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/core/presentation/ui/tabs";
import {ProductCatalog} from "@/modules/beverage-sales/presentation/components/product-catalog";
import {BundleCatalog} from "@/modules/beverage-sales/presentation/components/bundle-catalog";
import {WineIcon, GiftIcon} from "lucide-react";

interface CatalogTabsProps {
    tab: 'products' | 'bundles';
    onTabChange: (tab: 'products' | 'bundles') => void;
    products?: ProductInterface[];
    isLoadingProducts: boolean;
    bundles?: EnrichedBundle[];
    isLoadingBundles: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    cartItems: CartItemLine[];
    onAddToCart: (product: ProductInterface, unit: MovementUnitEnum, unitPrice: number) => void;
    onUpdateItemQty: (productId: string, quantity: number) => void;
    onAddBundleToCart: (bundle: EnrichedBundle, unitPrice: number) => void;
    isReadOnly?: boolean;
}

export function CatalogTabs({
    tab,
    onTabChange,
    products,
    isLoadingProducts,
    bundles,
    isLoadingBundles,
    searchTerm,
    onSearchChange,
    cartItems,
    onAddToCart,
    onUpdateItemQty,
    onAddBundleToCart,
    isReadOnly,
}: CatalogTabsProps) {
    return (
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as 'products' | 'bundles')} className="w-full">
            <TabsList className="w-full">
                <TabsTrigger value="products" className="flex-1">
                    <WineIcon data-icon="inline-start"/>
                    Boissons
                </TabsTrigger>
                <TabsTrigger value="bundles" className="flex-1">
                    <GiftIcon data-icon="inline-start"/>
                    Kits
                </TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="flex flex-col mt-4">
                <ProductCatalog
                    products={products}
                    isLoading={isLoadingProducts}
                    searchTerm={searchTerm}
                    onSearchChange={onSearchChange}
                    cartItems={cartItems}
                    onAdd={onAddToCart}
                    onUpdateQty={onUpdateItemQty}
                    isReadOnly={isReadOnly}
                />
            </TabsContent>
            <TabsContent value="bundles" className="flex flex-col mt-4">
                <BundleCatalog
                    bundles={bundles}
                    isLoading={isLoadingBundles}
                    onAdd={onAddBundleToCart}
                    isReadOnly={isReadOnly}
                />
            </TabsContent>
        </Tabs>
    );
}
