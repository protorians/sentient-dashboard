"use client"

import React, {useMemo, useState} from "react";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {BundleTypeEnum} from "@/modules/beverage-sales/domain/enums/bundle-type.enum";
import {CreateBundleItemInterface} from "@/modules/beverage-sales/domain/bundle-item.interface";
import {Button} from "@/core/presentation/ui/button";
import {Card} from "@/core/presentation/ui/card";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {DataGrid, RowAction} from "@/core/presentation/data-grid/data-grid";
import {DataGridSearchEngine} from "@/core/presentation/data-grid/data-grid-search-engine";
import {Table} from "@tanstack/react-table";
import {getBundleColumns} from "@/modules/beverage-sales/presentation/components/bundle-columns";
import {BundleFormDialog} from "@/modules/beverage-sales/presentation/components/bundle-form-dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/core/presentation/ui/alert-dialog";
import {PencilIcon, TrashIcon, GiftIcon, PackageOpenIcon, PlusIcon} from "lucide-react";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {generateBundleSku} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

interface BundleManagerProps {
    bundles?: BundleInterface[];
    isLoading?: boolean;
    products?: ProductInterface[];
    isLoadingProducts?: boolean;
    isSaving?: boolean;
    onSave: (bundle: BundleInterface | null, payload: { name: string; sku?: string; description?: string; type: BundleTypeEnum; price?: number; items: CreateBundleItemInterface[] }) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function BundleManager({bundles, isLoading, products, isLoadingProducts, isSaving, onSave, onDelete}: BundleManagerProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<BundleInterface | null>(null);
    const [deleting, setDeleting] = useState<BundleInterface | null>(null);
    const [search, setSearch] = useState('');

    const filteredBundles = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return bundles || [];
        return (bundles || []).filter(bundle =>
            bundle.name.toLowerCase().includes(query) ||
            (bundle.sku ?? '').toLowerCase().includes(query)
        );
    }, [bundles, search]);

    const nextSku = useMemo(() => generateBundleSku(bundles), [bundles]);

    const handleOpenCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (bundle: BundleInterface) => {
        setEditing(bundle);
        setDialogOpen(true);
    };

    const handleSave = async (payload: { name: string; sku?: string; description?: string; type: BundleTypeEnum; price?: number; items: CreateBundleItemInterface[] }) => {
        await onSave(editing, payload);
        setDialogOpen(false);
    };

    const rowActions = (bundle: BundleInterface): RowAction<BundleInterface>[] => [
        {
            id: "edit",
            label: "Modifier",
            icon: <PencilIcon className="size-4"/>,
            onExecute: (b) => handleOpenEdit(b),
        },
        {
            id: "delete",
            label: "Supprimer",
            icon: <TrashIcon className="size-4"/>,
            variant: "destructive",
            onExecute: (b) => setDeleting(b),
        },
    ];

    const toolbar = (table: Table<BundleInterface>) => (
        <React.Fragment>
            <DataGridSearchEngine table={table} value={search} onChange={setSearch}/>
            {isLoading && (
                <div className="flex items-center justify-center">
                    <WaitingActivity size={16}/>
                </div>
            )}
        </React.Fragment>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="p-6 border-none shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-xl">
                            <GiftIcon className="size-5 text-primary"/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Gestion des bundles</h3>
                            <p className="text-xs text-muted-foreground">
                                Compositions, recettes, bundles et kits vendus en un clic
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleOpenCreate}>
                        <PlusIcon/>
                        Nouveau kit
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><WaitingActivity size={32}/></div>
            ) : !bundles || bundles.length === 0 ? (
                <Card className="p-12 border-none shadow-sm flex items-center justify-center">
                    <Empty>
                        <EmptyMedia>
                            <PackageOpenIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Bundles</EmptyTitle>
                        <EmptyDescription>Aucun bundle pour le moment</EmptyDescription>
                        <EmptyContent>
                            <Button onClick={handleOpenCreate}>
                                <PlusIcon/>
                                Créer le premier bundle
                            </Button>
                        </EmptyContent>
                    </Empty>
                </Card>
            ) : (
                <DataGrid
                    data={filteredBundles}
                    columns={getBundleColumns()}
                    getRowId={row => row.id}
                    actions={rowActions}
                    toolbar={toolbar}
                    initialPageSize={10}
                />
            )}

            <BundleFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                products={products}
                isLoadingProducts={isLoadingProducts}
                bundle={editing}
                nextSku={nextSku}
                onSave={handleSave}
                isSaving={isSaving}
            />

            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le bundle</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous vraiment supprimer « {deleting?.name} » ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deleting) onDelete(deleting.id);
                                setDeleting(null);
                            }}
                        >
                            <TrashIcon/>
                            Supprimer
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
