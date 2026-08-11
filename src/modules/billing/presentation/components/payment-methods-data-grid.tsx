"use client"

import {DataGrid, RowAction} from "@/core/presentation/data-grid/data-grid"
import {getPaymentMethodColumns} from "@/modules/billing/presentation/components/payment-methods-columns"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service"
import {PaymentMethodInterface} from "@/modules/billing/domain/payment-method.interface"
import {AppConfig} from "@/core/domain/config/app.config"
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty"
import {CreditCardIcon, PencilIcon, TrashIcon} from "lucide-react"
import {Button} from "@/core/presentation/ui/button"
import {useRouter} from "next/navigation"
import {Fragment, useEffect, useMemo, useState} from "react"
import {DataGridSearchEngine} from "@/core/presentation/data-grid/data-grid-search-engine"
import {Table} from "@tanstack/react-table"
import {WaitingActivity} from "@/core/presentation/waiting-activity"
import {Waiting} from "@/core/presentation/waiting"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/core/presentation/ui/alert-dialog"
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth"
import {toast} from "sonner"
import {useMutation} from "@tanstack/react-query"
import {useModalStepper} from "@/core/presentation/modals/components/ModalStepper"
import {PaymentMethodTypeEnum, PAYMENT_METHOD_TYPE_LABELS} from "@/modules/billing/domain/enums/payment-method-type.enum"
import {CreatePaymentMethodInterface} from "@/modules/billing/domain/payment-method.interface"
import {ModalStepperStep} from "@/core/presentation/modals/components/ModalStepper"
import {LegacyInput} from "@/core/presentation/ui/legacy-input"
import {FieldGroup} from "@/core/presentation/ui/field"

interface PaymentMethodFormData extends CreatePaymentMethodInterface {
    status?: boolean;
}

export function PaymentMethodsDataGrid() {
    const [mounted, setMounted] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [deleting, setDeleting] = useState<PaymentMethodInterface | null>(null)
    const [editingMethod, setEditingMethod] = useState<PaymentMethodInterface | null>(null)

    const {currentOrganization} = useAuth()
    const queryClient = useQueryClient()
    const router = useRouter()

    const openStepper = useModalStepper<PaymentMethodFormData>({
        size: 'LG'
    })

    const {data: paymentMethods, isLoading} = useQuery<PaymentMethodInterface[]>({
        queryKey: ['billing', 'payment-methods', 'table'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const response = await BillingApiService.getPaymentMethods()
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
        refetchInterval: AppConfig.APP_REFRESH_UI
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => BillingApiService.deletePaymentMethod(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['billing', 'payment-methods']})
            toast.success("Moyen de paiement supprimé")
            setDeleting(null)
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Erreur lors de la suppression")
        }
    })

    const handleDelete = async () => {
        if (!deleting) return
        await deleteMutation.mutateAsync(deleting.id)
    }

    const handleEdit = async (method: PaymentMethodInterface) => {
        const isEditing = true;
        const initialData: Partial<PaymentMethodFormData> = {
            name: method.name,
            type: method.type,
            feeAmount: method.feeAmount,
            feeRate: method.feeRate,
            status: method.status,
        };

        const steps: ModalStepperStep<PaymentMethodFormData>[] = [
            {
                id: 'details',
                required: true,
                title: 'Informations',
                description: 'Modifier le moyen de paiement',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacyInput
                            id="pm-name"
                            label="Nom"
                            description="Nom affiché pour ce moyen de paiement."
                            input={{
                                required: true,
                                type: "text",
                                placeholder: "Espèces, Orange Money, Carte...",
                                value: data.name || '',
                                onChange: e => updateData({name: e.target.value}),
                            }}
                            icon={<CreditCardIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={data.type || PaymentMethodTypeEnum.CASH}
                                onChange={e => updateData({type: e.target.value as PaymentMethodTypeEnum})}
                            >
                                {Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <LegacyInput
                                id="pm-fee-rate"
                                label="Frais (%)"
                                description="Pourcentage sur le montant."
                                input={{
                                    type: "number",
                                    min: 0,
                                    step: "0.01",
                                    placeholder: "0",
                                    value: String(data.feeRate ?? 0),
                                    onChange: e => updateData({feeRate: Number(e.target.value) || 0}),
                                }}
                            />
                            <LegacyInput
                                id="pm-fee-amount"
                                label="Frais fixes (FCFA)"
                                description="Montant fixe par transaction."
                                input={{
                                    type: "number",
                                    min: 0,
                                    placeholder: "0",
                                    value: String(data.feeAmount ?? 0),
                                    onChange: e => updateData({feeAmount: Number(e.target.value) || 0}),
                                }}
                            />
                        </div>
                    </FieldGroup>
                )
            },
            {
                id: 'confirmation',
                title: 'Confirmation',
                description: 'Vérifiez avant enregistrement',
                content: ({data}) => (
                    <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Moyen de paiement</div>
                            <p><strong>Nom :</strong> {data.name || 'N/A'}</p>
                            <p><strong>Type :</strong> {PAYMENT_METHOD_TYPE_LABELS[data.type as PaymentMethodTypeEnum] ?? data.type}</p>
                            <p><strong>Frais (%) :</strong> {data.feeRate ?? 0} %</p>
                            <p><strong>Frais fixes :</strong> {(data.feeAmount ?? 0).toLocaleString('fr-FR')} FCFA</p>
                        </div>
                    </div>
                )
            },
        ];

        try {
            await openStepper({
                steps,
                title: "Modifier le moyen de paiement",
                initialData,
                onEnd: async ({data}) => {
                    if (!method?.id) throw new Error("ID non trouvé");
                    const updated = await BillingApiService.updatePaymentMethod(method.id, {
                        name: data.name,
                        type: data.type,
                        feeAmount: data.feeAmount,
                        feeRate: data.feeRate,
                    });

                    if (!updated.data?.data || updated.data.error) {
                        throw new Error(updated.data?.message || "Erreur lors de la mise à jour.");
                    }

                    toast.success(`Moyen de paiement ${data.name || ''} modifié avec succès`);
                    await queryClient.invalidateQueries({queryKey: ['billing', 'payment-methods']});
                }
            });
        } catch (error) {
            console.error('Edit Payment Method Stepper Error:', error);
            toast.error("Erreur lors de la modification.");
        }
    };

    const methods = paymentMethods ?? []

    const filteredMethods = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return methods
        return methods.filter(m =>
            (m.name || '').toLowerCase().includes(query) ||
            (m.type || '').toLowerCase().includes(query)
        )
    }, [methods, search])

    const toolbar = (table: Table<PaymentMethodInterface>) => (
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

    const rowActions = (method: PaymentMethodInterface): RowAction<PaymentMethodInterface>[] => [
        {
            id: "edit",
            label: "Modifier",
            icon: <PencilIcon className="size-4"/>,
            onExecute: (m) => handleEdit(m),
        },
        {
            id: "delete",
            label: "Supprimer",
            icon: <TrashIcon className="size-4"/>,
            variant: "destructive",
            onExecute: (m) => setDeleting(m),
        },
    ]

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, [])

    return (
        <div className="flex-auto">
            {(methods.length > 0 || mounted) ? (
                <Fragment>
                    <DataGrid
                        data={filteredMethods}
                        columns={getPaymentMethodColumns()}
                        getRowId={row => row.id}
                        enableSelection
                        actions={rowActions}
                        toolbar={(table) => toolbar(table)}
                    />

                    <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le moyen de paiement</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Voulez-vous vraiment supprimer « {deleting?.name} » ? Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[50dvh]">
                    <Empty>
                        <EmptyMedia>
                            <CreditCardIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Moyens de paiement</EmptyTitle>
                        <EmptyDescription>Tous les moyens de paiement configurés s'afficheront ici</EmptyDescription>
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
