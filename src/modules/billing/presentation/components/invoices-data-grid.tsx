"use client"

import {DataGrid, RowAction} from "@/core/presentation/data-grid/data-grid"
import {getInvoiceColumns} from "@/modules/billing/presentation/components/invoices-columns"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service"
import {InvoiceInterface} from "@/modules/billing/domain/invoice.interface"
import {AppConfig} from "@/core/domain/config/app.config"
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty"
import {CreditCardIcon, EyeIcon, FileTextIcon} from "lucide-react"
import {Button} from "@/core/presentation/ui/button"
import {useRouter} from "next/navigation"
import {Fragment, useCallback, useEffect, useMemo, useState} from "react"
import {DataGridSearchEngine} from "@/core/presentation/data-grid/data-grid-search-engine"
import {Table} from "@tanstack/react-table"
import {WaitingActivity} from "@/core/presentation/waiting-activity"
import {Waiting} from "@/core/presentation/waiting"
import {InvoiceDetailsSheet} from "@/modules/billing/presentation/components/invoice-details-sheet"
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth"

export function InvoicesDataGrid() {
    const [mounted, setMounted] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [detailsInvoice, setDetailsInvoice] = useState<InvoiceInterface | null>(null)

    const {currentOrganization} = useAuth()
    const queryClient = useQueryClient()
    const router = useRouter()

    const {data: invoices, isLoading} = useQuery<InvoiceInterface[]>({
        queryKey: ['billing', 'invoices', 'table'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const response = await BillingApiService.getInvoices()
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
        refetchInterval: AppConfig.APP_REFRESH_UI
    })

    const filteredInvoices = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return invoices ?? []
        return (invoices ?? []).filter(i =>
            (i.invoiceNumber || '').toLowerCase().includes(query)
        )
    }, [invoices, search])

    const toolbar = (table: Table<InvoiceInterface>) => (
        <Fragment>
            <DataGridSearchEngine table={table} value={search} onChange={setSearch}/>
            {isLoading && (
                <div className="flex-auto flex items-center justify-center">
                    <WaitingActivity size={16}/>
                </div>
            )}
        </Fragment>
    )

    const rowActions = (invoice: InvoiceInterface): RowAction<InvoiceInterface>[] => {
        const actions: RowAction<InvoiceInterface>[] = [
            {
                id: "details",
                label: "Détails",
                icon: <EyeIcon className="size-4"/>,
                onExecute: (i) => setDetailsInvoice(i),
            },
        ]

        if (invoice.status === 'UNPAID' || invoice.status === 'OVERDUE') {
            actions.push({
                id: "pay",
                label: "Encaisser",
                icon: <CreditCardIcon className="size-4"/>,
                onExecute: () => {},
            })
        }

        return actions
    }

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, [])

    const handleCloseDetails = useCallback((open: boolean) => {
        if (!open) setDetailsInvoice(null)
    }, [])

    return (
        <div className="flex-auto">
            {((invoices?.length ?? 0) > 0 || mounted) ? (
                <Fragment>
                    <DataGrid
                        data={filteredInvoices}
                        columns={getInvoiceColumns()}
                        getRowId={row => row.id}
                        enableSelection
                        actions={rowActions}
                        toolbar={(table) => toolbar(table)}
                    />

                    {detailsInvoice && (
                        <InvoiceDetailsSheet
                            invoice={detailsInvoice}
                            opened={!!detailsInvoice}
                            onOpenChange={handleCloseDetails}
                        />
                    )}
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[50dvh]">
                    <Empty>
                        <EmptyMedia>
                            <FileTextIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Factures</EmptyTitle>
                        <EmptyDescription>Toutes les factures s'afficheront ici</EmptyDescription>
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
