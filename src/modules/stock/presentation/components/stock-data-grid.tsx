"use client"

import {DataGrid, RowAction} from "@/core/presentation/data-grid/data-grid";
import {getStockColumns} from "@/modules/stock/presentation/components/stock-columns";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {AppConfig} from "@/core/domain/config/app.config";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {EyeIcon, LayersIcon, PackageIcon} from "lucide-react";
import {Button} from "@/core/presentation/ui/button";
import {useRouter} from "next/navigation";
import {Fragment, useEffect, useMemo, useState} from "react";
import {DataGridSearchEngine} from "@/core/presentation/data-grid/data-grid-search-engine";
import {Table} from "@tanstack/react-table";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {Waiting} from "@/core/presentation/waiting";
import {ProductDetailsSheet} from "@/modules/stock/presentation/components/product-details-sheet";
import {RecordStockMovementStepper} from "@/modules/stock/presentation/components/record-stock-movement-stepper";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";

export function StockDataGrid() {
    const [mounted, setMounted] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')

    const [detailsProduct, setDetailsProduct] = useState<ProductInterface | null>(null)
    const [movementProduct, setMovementProduct] = useState<ProductInterface | null>(null)

    const {currentOrganization} = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter()

    const {data: products, isLoading} = useQuery<ProductInterface[]>({
        queryKey: ['stock', 'products', 'table'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const responses = await StockApiService.getAll();
            const list = responses.data?.data || [];

            const stockResults = await Promise.allSettled(
                list.map(async (product: ProductInterface) => {
                    if (!product.id) return {index: list.indexOf(product), product};
                    try {
                        const stock = await StockApiService.getProductStock(product.id);
                        return {index: list.indexOf(product), product: {...product, stock: stock.data?.data}};
                    } catch {
                        return {index: list.indexOf(product), product};
                    }
                })
            );

            const enrichedMap = new Map<number, ProductInterface>();
            stockResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    enrichedMap.set(result.value.index, result.value.product);
                }
            });
            return Array.from({length: list.length}, (_, i) => enrichedMap.get(i) ?? list[i]);
        },
        refetchInterval: AppConfig.APP_REFRESH_UI
    })

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return products || [];
        return (products || []).filter(product =>
            (product.name || '').toLowerCase().includes(query) ||
            (product.sku || '').toLowerCase().includes(query)
        );
    }, [products, search]);

    const toolbar = (table: Table<ProductInterface>) => (
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

    const rowActions = (product: ProductInterface): RowAction<ProductInterface>[] => [
        {
            id: "details",
            label: "Détails",
            icon: <EyeIcon className="size-4"/>,
            onExecute: (p) => setDetailsProduct(p),
        },
        {
            id: "movement",
            label: "Mouvement de stock",
            icon: <LayersIcon className="size-4"/>,
            onExecute: (p) => setMovementProduct(p),
        },
    ]

    const stockColumns = getStockColumns()

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, []);

    return (
        <div className="flex-auto">
            {(products?.length || mounted) ? (
                <Fragment>
                    <DataGrid
                        data={filteredProducts as ProductInterface[]}
                        columns={stockColumns}
                        getRowId={row => row.id ?? row.sku ?? row.name}
                        enableSelection
                        actions={rowActions}
                        toolbar={(table) => toolbar(table)}
                    />

                    {detailsProduct && (
                        <ProductDetailsSheet
                            product={detailsProduct}
                            opened={!!detailsProduct}
                            onOpenChange={(open) => !open && setDetailsProduct(null)}
                        />
                    )}

                    {movementProduct && (
                        <RecordStockMovementStepper
                            product={movementProduct}
                            queryClient={queryClient}
                            onClose={() => setMovementProduct(null)}
                        />
                    )}
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[70dvh]">
                    <Empty>
                        <EmptyMedia>
                            <PackageIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Produits</EmptyTitle>
                        <EmptyDescription>Tous les produits s'afficheront ici</EmptyDescription>
                        {isLoading && (<EmptyDescription>
                            <Waiting label={"En attente de produits"}/>
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
