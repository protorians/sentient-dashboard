"use client"

import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {createColumnHelper, type ColumnDef} from "@tanstack/react-table";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {PaymentMethodInterface} from "@/modules/beverage-sales/domain/payment-method.interface";
import {PAYMENT_METHOD_TYPE_LABELS} from "@/modules/beverage-sales/domain/enums/payment-method-type.enum";
import {SettingsLayout} from "@/modules/beverage-sales/presentation/components/settings-layout";
import {AnimatedContent} from "@/core/presentation/animated-content";
import {
    PaymentMethodFormDialog,
    PaymentMethodFormData,
} from "@/modules/beverage-sales/presentation/components/payment-method-form-dialog";
import {useSettingsMutations} from "@/modules/beverage-sales/presentation/hooks/use-settings-mutations";
import {Button} from "@/core/presentation/ui/button";
import {Badge} from "@/core/presentation/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {DataGrid, type RowAction} from "@/core/presentation/data-grid/data-grid";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/core/presentation/ui/alert-dialog";
import {
    BanknoteIcon,
    CreditCardIcon,
    LandmarkIcon,
    PencilIcon,
    PlusIcon,
    SmartphoneIcon,
    TrashIcon,
    WalletIcon,
} from "lucide-react";

const PAYMENT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    CASH: BanknoteIcon,
    CREDIT_CARD: CreditCardIcon,
    DEBIT_CARD: CreditCardIcon,
    MOBILE_MONEY: SmartphoneIcon,
    BANK_TRANSFER: LandmarkIcon,
    CHECK: CreditCardIcon,
    E_WALLET: WalletIcon,
};

const columnHelper = createColumnHelper<PaymentMethodInterface>();

const columns: ColumnDef<PaymentMethodInterface, any>[] = [
    columnHelper.accessor("name", {
        header: "Nom",
        cell: ({getValue}) => <span className="font-medium">{getValue()}</span>,
    }),
    columnHelper.accessor("type", {
        header: "Type",
        cell: ({getValue}) => {
            const typeValue = getValue();
            const TypeIcon = PAYMENT_TYPE_ICONS[typeValue] ?? CreditCardIcon;
            return (
                <div className="flex items-center gap-2">
                    <TypeIcon className="size-3.5 text-muted-foreground"/>
                    {PAYMENT_METHOD_TYPE_LABELS[typeValue as keyof typeof PAYMENT_METHOD_TYPE_LABELS] ?? typeValue}
                </div>
            );
        },
    }),
    columnHelper.display({
        id: "fees",
        header: "Frais",
        cell: ({row}) => {
            const {feeRate, feeAmount} = row.original;
            if (feeRate <= 0 && feeAmount <= 0) return <span className="text-muted-foreground">—</span>;
            return (
                <span className="text-muted-foreground">
                    {feeRate > 0 ? `${feeRate} %` : ""}
                    {feeRate > 0 && feeAmount > 0 ? " · " : ""}
                    {feeAmount > 0 ? `${feeAmount.toLocaleString('fr-FR')} FCFA` : ""}
                </span>
            );
        },
    }),
    columnHelper.accessor("status", {
        header: "Statut",
        cell: ({getValue}) => (
            <Badge variant={getValue() ? "default" : "secondary"}>
                {getValue() ? "Actif" : "Inactif"}
            </Badge>
        ),
    }),
];

export default function PaymentMethodsSettingsView() {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<PaymentMethodInterface | null>(null);
    const [deleting, setDeleting] = useState<PaymentMethodInterface | null>(null);

    const {data: paymentMethods, isLoading} = useQuery<PaymentMethodInterface[]>({
        queryKey: ['billing', 'payment-methods'],
        queryFn: async () => {
            const response = await BillingApiService.getPaymentMethods();
            return response.data?.data?.data ?? response.data?.data ?? [];
        }
    });

    const {
        createPaymentMethodMutation,
        updatePaymentMethodMutation,
        deletePaymentMethodMutation,
    } = useSettingsMutations();

    const handleSave = async (data: PaymentMethodFormData) => {
        if (editing) {
            await updatePaymentMethodMutation.mutateAsync({id: editing.id, payload: data});
        } else {
            await createPaymentMethodMutation.mutateAsync(data);
        }
        setFormOpen(false);
        setEditing(null);
    };

    const handleDelete = async () => {
        if (!deleting) return;
        await deletePaymentMethodMutation.mutateAsync(deleting.id);
        setDeleting(null);
    };

    const methods = paymentMethods ?? [];

    const rowActions = (method: PaymentMethodInterface): RowAction<PaymentMethodInterface>[] => [
        {
            id: "edit",
            label: "Modifier",
            icon: <PencilIcon/>,
            onExecute: () => {
                setEditing(method);
                setFormOpen(true);
            },
        },
        {
            id: "delete",
            label: "Supprimer",
            icon: <TrashIcon/>,
            variant: "destructive",
            onExecute: () => setDeleting(method),
        },
    ];

    return (
        <SettingsLayout.Section>
            <AnimatedContent variant="enter">
            <SettingsLayout.Header
                title="Modes de paiement"
                description="Configurez les moyens de paiement disponibles à la caisse."
                actions={
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                    >
                        <PlusIcon/>
                        Ajouter un mode de paiement
                    </Button>
                }
            />

            <div className="">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <WaitingActivity size={28}/>
                    </div>
                ) : methods.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CreditCardIcon/>
                            </EmptyMedia>
                            <EmptyTitle>Aucun mode de paiement</EmptyTitle>
                            <EmptyDescription>
                                Ajoutez un mode de paiement pour pouvoir encaisser les commandes.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <DataGrid
                        data={methods}
                        columns={columns}
                        getRowId={(m) => m.id}
                        actions={rowActions}
                        enablePagination={false}
                        enableColumnVisibility={false}
                    />
                )}
            </div>

            <PaymentMethodFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                method={editing}
                onSave={handleSave}
                isSaving={createPaymentMethodMutation.isPending || updatePaymentMethodMutation.isPending}
            />

            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le mode de paiement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous vraiment supprimer « {deleting?.name} » ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deletePaymentMethodMutation.isPending}
                        >
                            {deletePaymentMethodMutation.isPending ? <WaitingActivity size={16}/> : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </AnimatedContent>
        </SettingsLayout.Section>
    );
}
