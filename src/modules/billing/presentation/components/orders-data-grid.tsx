"use client"

import {DataGrid, RowAction} from "@/core/presentation/data-grid/data-grid"
import {getOrderColumns} from "@/modules/billing/presentation/components/orders-columns"
import {useQuery} from "@tanstack/react-query"
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service"
import {OrderInterface} from "@/modules/billing/domain/order.interface"
import {AppConfig} from "@/core/domain/config/app.config"
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty"
import {EyeIcon, PackageIcon} from "lucide-react"
import {Button} from "@/core/presentation/ui/button"
import {useRouter} from "next/navigation"
import {Fragment, useCallback, useEffect, useMemo, useState} from "react"
import {DataGridSearchEngine} from "@/core/presentation/data-grid/data-grid-search-engine"
import {Table} from "@tanstack/react-table"
import {WaitingActivity} from "@/core/presentation/waiting-activity"
import {Waiting} from "@/core/presentation/waiting"
import {OrderDetailsSheet} from "@/modules/billing/presentation/components/order-details-sheet"
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth"

export function OrdersDataGrid() {
    const [mounted, setMounted] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [detailsOrder, setDetailsOrder] = useState<OrderInterface | null>(null)

    const {currentOrganization} = useAuth()
    const router = useRouter()

    const {data: orders, isLoading} = useQuery<OrderInterface[]>({
        queryKey: ['billing', 'orders', 'table'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const response = await BillingApiService.getOrders()
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
        refetchInterval: AppConfig.APP_REFRESH_UI
    })

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return orders ?? []
        return (orders ?? []).filter(o =>
            (o.orderNumber || '').toLowerCase().includes(query)
        )
    }, [orders, search])

    const toolbar = (table: Table<OrderInterface>) => (
        <Fragment>
            <DataGridSearchEngine
                table={table}
                value={search}
                onChange={setSearch}
            />
            {isLoading && (
                <div className="flex-auto flex items-center justify-center">
                    <WaitingActivity size={16}/>
                </div>
            )}
        </Fragment>
    )

    const rowActions = (order: OrderInterface): RowAction<OrderInterface>[] => [
        {
            id: "details",
            label: "Détails",
            icon: <EyeIcon className="size-4"/>,
            onExecute: (o) => setDetailsOrder(o),
        },
    ]

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, [])

    const handleCloseDetails = useCallback((open: boolean) => {
        if (!open) setDetailsOrder(null)
    }, [])

    return (
        <div className="flex-auto">
            {((orders?.length ?? 0) > 0 || mounted) ? (
                <Fragment>
                    <DataGrid
                        data={filteredOrders}
                        columns={getOrderColumns()}
                        getRowId={row => row.id}
                        enableSelection
                        actions={rowActions}
                        toolbar={(table) => toolbar(table)}
                    />

                    {detailsOrder && (
                        <OrderDetailsSheet
                            order={detailsOrder}
                            opened={!!detailsOrder}
                            onOpenChange={handleCloseDetails}
                        />
                    )}
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[50dvh]">
                    <Empty>
                        <EmptyMedia>
                            <PackageIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Commandes</EmptyTitle>
                        <EmptyDescription>Toutes les commandes s'afficheront ici</EmptyDescription>
                        {isLoading && (<EmptyDescription>
                            <Waiting label={"Chargement..."}/>
                        </EmptyDescription>)}
                        <EmptyContent>
                            <Button onClick={router.refresh} variant="outline">
                                Actualiser
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            )}
        </div>
    )
}
