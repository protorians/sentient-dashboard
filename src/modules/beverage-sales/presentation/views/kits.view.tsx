"use client"

import React from "react";
import {BundleTypeEnum} from "@/modules/beverage-sales/domain/enums/bundle-type.enum";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {CreateBundleItemInterface} from "@/modules/beverage-sales/domain/bundle-item.interface";
import {useBeverageSalesQueries} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-queries";
import {useBeverageSalesMutations} from "@/modules/beverage-sales/presentation/hooks/use-beverage-sales-mutations";
import {BundleManager} from "@/modules/beverage-sales/presentation/components/bundle-manager";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {DepotSetupDialog} from "@/modules/beverage-sales/presentation/components/depot-setup-dialog";

export default function KitsView() {
    const [bundleSearch, setBundleSearch] = React.useState<string>("");

    const {
        products,
        isLoadingProducts,
        enrichedBundles,
        isLoadingBundles,
        warehouses,
    } = useBeverageSalesQueries(null, bundleSearch);

    const {
        saveBundleMutation,
        deleteBundleMutation,
        depotWarehouseId,
    } = useBeverageSalesMutations(warehouses);

    const handleSaveBundle = async (
        bundle: BundleInterface | null,
        payload: { name: string; sku?: string; description?: string; type: BundleTypeEnum; price?: number; items: CreateBundleItemInterface[] }
    ) => {
        await saveBundleMutation.mutateAsync({bundle, payload});
    };

    const handleDeleteBundle = async (id: string) => {
        await deleteBundleMutation.mutateAsync(id);
    };

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

    return (
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
    );
}
