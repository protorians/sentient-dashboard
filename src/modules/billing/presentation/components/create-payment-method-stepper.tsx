'use client';

import React, {Fragment} from 'react';
import {Button, buttonVariants} from '@/core/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {CreditCardIcon, PencilIcon, PlusIcon} from "lucide-react";
import {VariantProps} from "class-variance-authority";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {
    CreatePaymentMethodInterface,
    PaymentMethodInterface,
} from "@/modules/billing/domain/payment-method.interface";
import {
    PaymentMethodTypeEnum,
    PAYMENT_METHOD_TYPE_OPTIONS,
    PAYMENT_METHOD_TYPE_LABELS,
} from "@/modules/billing/domain/enums/payment-method-type.enum";
import {LegacyInput} from "@/core/presentation/ui/legacy-input";
import {FieldGroup} from "@/core/presentation/ui/field";
import {QueryClient, useQueryClient} from "@tanstack/react-query";

interface PaymentMethodFormData extends CreatePaymentMethodInterface {
    status?: boolean;
}

export interface CreatePaymentMethodStepperProps {
    variant?: VariantProps<typeof buttonVariants>['variant'];
    size?: VariantProps<typeof buttonVariants>['size'];
    label?: string;
    className?: string;
}

export function CreatePaymentMethodStepper({variant = "default", size = "lg", label, className}: CreatePaymentMethodStepperProps) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<PaymentMethodFormData>({
        size: 'LG'
    });

    return (
        <Button onClick={() => handleOpen(openStepper, queryClient, null)} variant={variant} size={size} className={className}>
            <PlusIcon/>
            {label ?? 'Ajouter un moyen de paiement'}
        </Button>
    );
}

export function EditPaymentMethodStepper({method}: { method: PaymentMethodInterface }) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<PaymentMethodFormData>({
        size: 'LG'
    });

    return (
        <div onClick={() => handleOpen(openStepper, queryClient, method)}>
            <PencilIcon className="size-4"/>
        </div>
    );
}

async function handleOpen(
    openStepper: ReturnType<typeof useModalStepper<PaymentMethodFormData>>,
    queryClient: QueryClient,
    editing: PaymentMethodInterface | null
) {
    const isEditing = !!editing;
    const initialData: Partial<PaymentMethodFormData> = editing
        ? {name: editing.name, type: editing.type, feeAmount: editing.feeAmount, feeRate: editing.feeRate, status: editing.status}
        : {type: PaymentMethodTypeEnum.CASH, feeAmount: 0, feeRate: 0};

    const steps: ModalStepperStep<PaymentMethodFormData>[] = [
        {
            id: 'details',
            required: true,
            title: 'Informations',
            description: isEditing ? 'Modifier le moyen de paiement' : 'Nom, type et frais',
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
                            {PAYMENT_METHOD_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
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
            description: 'Vérifiez les informations avant enregistrement',
            content: ({data}) => (
                <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                    <div>
                        <div className="text-lg font-bold border-b pb-1 mb-2">Moyen de paiement</div>
                        <p><strong>Nom :</strong> {data.name || 'N/A'}</p>
                        <p><strong>Type :</strong> {PAYMENT_METHOD_TYPE_LABELS[data.type as PaymentMethodTypeEnum] ?? data.type}</p>
                        <p><strong>Frais (%) :</strong> {data.feeRate ?? 0} %</p>
                        <p><strong>Frais fixes :</strong> {(data.feeAmount ?? 0).toLocaleString('fr-FR')} FCFA</p>
                        {isEditing && (
                            <p><strong>Statut :</strong> {data.status === false ? 'Inactif' : 'Actif'}</p>
                        )}
                    </div>
                </div>
            )
        },
    ];

    try {
        await openStepper({
            steps,
            title: isEditing ? "Modifier le moyen de paiement" : "Nouveau moyen de paiement",
            initialData,
            onEnd: async ({data}) => {
                if (isEditing && editing?.id) {
                    const updated = await BillingApiService.updatePaymentMethod(editing.id, {
                        name: data.name,
                        type: data.type,
                        feeAmount: data.feeAmount,
                        feeRate: data.feeRate,
                    });

                    if (!updated.data?.data || updated.data.error) {
                        throw new Error(updated.data?.message || "Erreur lors de la mise à jour.");
                    }

                    toast.success(`Moyen de paiement ${data.name || ''} modifié avec succès`);
                } else {
                    const created = await BillingApiService.addPaymentMethod({
                        name: data.name || '',
                        type: data.type || PaymentMethodTypeEnum.CASH,
                        feeAmount: data.feeAmount ?? 0,
                        feeRate: data.feeRate ?? 0,
                    });

                    if (!created.data?.data || created.data.error) {
                        throw new Error(created.data?.message || "Erreur lors de la création.");
                    }

                    toast.success(`Moyen de paiement ${data.name || ''} créé avec succès`);
                }

                await queryClient.invalidateQueries({queryKey: ['billing', 'payment-methods']});
            }
        });
    } catch (error) {
        console.error('Payment Method Stepper Error:', error);
        toast.error("Erreur lors de l'enregistrement du moyen de paiement.");
    }
}
