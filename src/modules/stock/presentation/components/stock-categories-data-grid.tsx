"use client"

import {DataGrid, RowAction} from "@/core/presentation/data-grid/data-grid";
import {getStockCategoriesColumns} from "@/modules/stock/presentation/components/stock-categories-columns";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ProductCategoryInterface} from "@/modules/stock/domain/product-category.interface";
import {AppConfig} from "@/core/domain/config/app.config";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {FolderTreeIcon, PencilIcon, TrashIcon} from "lucide-react";
import {Button} from "@/core/presentation/ui/button";
import {useRouter} from "next/navigation";
import {Fragment, useEffect, useMemo, useState} from "react";
import {DataGridSearchEngine} from "@/core/presentation/data-grid/data-grid-search-engine";
import {Table} from "@tanstack/react-table";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {Waiting} from "@/core/presentation/waiting";
import {ProductCategoryStepper} from "@/modules/stock/presentation/components/product-category-stepper";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/core/presentation/ui/alert-dialog";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {toast} from "sonner";

export function StockCategoriesDataGrid() {
    const [mounted, setMounted] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')

    const [categoryToDelete, setCategoryToDelete] = useState<ProductCategoryInterface | null>(null)
    const [categoryToEdit, setCategoryToEdit] = useState<ProductCategoryInterface | null>(null)
    const [deleting, setDeleting] = useState<boolean>(false)

    const {currentOrganization} = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter()

    const {data: categories, isLoading} = useQuery<ProductCategoryInterface[]>({
        queryKey: ['stock', 'categories', 'table'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const responses = await StockApiService.getProductCategories();
            return responses.data?.data || [];
        },
        refetchInterval: AppConfig.APP_REFRESH_UI
    })

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return categories || [];
        return (categories || []).filter(category =>
            (category.name || '').toLowerCase().includes(query) ||
            (category.description || '').toLowerCase().includes(query)
        );
    }, [categories, search]);

    const handleDelete = async (category?: ProductCategoryInterface | null) => {
        if (!category?.id) return;
        setDeleting(true);
        try {
            await StockApiService.deleteProductCategory(category.id);
            toast.success(`Catégorie ${category.name} supprimée avec succès`);
            await queryClient.invalidateQueries({queryKey: ['stock', 'categories']});
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Une erreur est survenue lors de la suppression de la catégorie.");
        } finally {
            setDeleting(false);
            setCategoryToDelete(null);
        }
    };

    const toolbar = (table: Table<ProductCategoryInterface>) => (
        <Fragment>
            <DataGridSearchEngine
                table={table}
                value={search}
                onChange={setSearch}
            />

            {
                isLoading && (
                    <div className="flex-auto flex items-center justify-center">
                        <WaitingActivity size={16}/>
                    </div>
                )
            }
        </Fragment>
    )

    const rowActions = (category: ProductCategoryInterface): RowAction<ProductCategoryInterface>[] => [
        {
            id: "edit",
            label: "Modifier",
            icon: <PencilIcon className="size-4"/>,
            onExecute: (c) => setCategoryToEdit(c),
        },
        {
            id: "delete",
            label: "Supprimer",
            icon: <TrashIcon className="size-4"/>,
            variant: "destructive",
            onExecute: (c) => setCategoryToDelete(c),
        },
    ]

    const stockCategoriesColumns = getStockCategoriesColumns()

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, []);

    return (
        <div className="flex-auto">
            {(categories?.length || mounted) ? (
                <Fragment>
                    <DataGrid
                        data={filteredCategories as ProductCategoryInterface[]}
                        columns={stockCategoriesColumns}
                        getRowId={row => row.id ?? row.name}
                        enableSelection
                        bulkActions={[
                            {
                                id: "delete-selected",
                                label: "Supprimer",
                                icon: <TrashIcon className="size-4"/>,
                                variant: "destructive",
                                onExecute: async (selected) => {
                                    for (const category of selected) {
                                        await handleDelete(category);
                                    }
                                },
                            },
                        ]}
                        actions={rowActions}
                        toolbar={(table) => toolbar(table)}
                    />

                    {categoryToEdit && (
                        <ProductCategoryStepper
                            category={categoryToEdit}
                        />
                    )}

                    <AlertDialog open={!!categoryToDelete}
                                 onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogMedia>
                                    <TrashIcon/>
                                </AlertDialogMedia>
                                <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Voulez-vous vraiment supprimer la catégorie « {categoryToDelete?.name} » ? Cette action
                                    est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction variant="destructive" onClick={() => handleDelete(categoryToDelete)}
                                                   disabled={deleting}>
                                    {deleting ? 'Suppression...' : 'Supprimer'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[70dvh]">
                    <Empty>
                        <EmptyMedia>
                            <FolderTreeIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Catégories produits</EmptyTitle>
                        <EmptyDescription>Toutes les catégories de produits s'afficheront ici</EmptyDescription>
                        {isLoading && (<EmptyDescription>
                            <Waiting label={"En attente de catégories"}/>
                        </EmptyDescription>)}
                        <EmptyContent>
                            <Button
                                onClick={router.refresh}
                                variant="outline">
                                Actualiser
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            )}
        </div>
    )
}
