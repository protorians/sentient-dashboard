'use client';

import React from 'react';
import {Button} from '@/core/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {FileTextIcon, PlusIcon} from "lucide-react";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {OrderInterface} from "@/modules/billing/domain/order.interface";
import {LegacyInput} from "@/core/presentation/ui/legacy-input";
import {FieldGroup} from "@/core/presentation/ui/field";
import {QueryClient} from "@tanstack/react-query";
import {cn} from "@/core/infrastructure/utilities/utils";
import {buttonVariants} from "@/core/presentation/ui/button";
import type {VariantProps} from "class-variance-authority";

interface CreateInvoiceFormData {
    orderId: string;
    dueDate?: string;
}

export interface CreateInvoiceStepperProps {
    variant?: VariantProps<typeof buttonVariants>['variant'];
    size?: VariantProps<typeof buttonVariants>['size'];
    label?: string;
    className?: string;
    queryClient: QueryClient;
    orders: OrderInterface[];
}

export function CreateInvoiceStepper({variant = "default", size = "lg", label, className, queryClient, orders}: CreateInvoiceStepperProps) {
    const openStepper = useModalStepper<CreateInvoiceFormData>({
        size: 'LG'
    });

    return (
        <Button onClick={() => handleOpen(openStepper, queryClient, orders)} variant={variant} size={size} className={className}>
            <PlusIcon/>
            {label ?? 'Générer une facture'}
        </Button>
    );
}

async function handleOpen(
    openStepper: ReturnType<typeof useModalStepper<CreateInvoiceFormData>>,
    queryClient: QueryClient,
    orders: OrderInterface[],
) {
    const steps: ModalStepperStep<CreateInvoiceFormData>[] = [
        {
            id: 'select',
            required: true,
            title: 'Sélection',
            description: 'Choisissez la commande à facturer',
            content: ({updateData, data}) => {
                const selectedOrder = orders.find(o => o.id === data.orderId);

                return (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">Commande *</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={data.orderId || ''}
                                onChange={e => updateData({orderId: e.target.value})}
                                required
                            >
                                <option value="">Sélectionner une commande</option>
                                {orders.map((order) => (
                                    <option key={order.id} value={order.id}>
                                        {order.orderNumber} — {order.totalAmount.toLocaleString('fr-FR')} FCFA
                                    </option>
                                ))}
                            </select>
                        </div>

                        <LegacyInput
                            id="invoice-due-date"
                            label="Date d'échéance"
                            description="Optionnelle, laissez vide si pas d'échéance."
                            input={{
                                type: "date",
                                value: data.dueDate || '',
                                onChange: e => updateData({dueDate: e.target.value}),
                            }}
                        />

                        {selectedOrder && (
                            <div className="p-3 bg-muted/40 rounded-lg">
                                <div className="text-sm font-medium">Récapitulatif</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    Montant : <span className="font-semibold">{selectedOrder.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Articles : {selectedOrder.items?.length ?? 0}
                                </div>
                            </div>
                        )}

                        {orders.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Aucune commande disponible pour générer une facture.
                            </p>
                        )}
                    </FieldGroup>
                );
            }
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Vérifiez avant de générer la facture',
            content: ({data}) => {
                const order = orders.find(o => o.id === data.orderId);

                return (
                    <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Facture</div>
                            <p><strong>Commande :</strong> {order?.orderNumber || 'N/A'}</p>
                            <p><strong>Montant :</strong> {order ? `${order.totalAmount.toLocaleString('fr-FR')} FCFA` : 'N/A'}</p>
                            <p><strong>Échéance :</strong> {data.dueDate || 'Non définie'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Une écriture comptable de vente sera automatiquement générée.
                        </p>
                    </div>
                );
            }
        },
    ];

    try {
        await openStepper({
            steps,
            title: "Générer une facture",
            initialData: {orderId: '', dueDate: ''},
            onEnd: async ({data}) => {
                if (!data.orderId) {
                    throw new Error("Veuillez sélectionner une commande.");
                }

                const created = await BillingApiService.createInvoice({
                    orderId: data.orderId,
                    dueDate: data.dueDate || undefined,
                });

                if (!created.data?.data || created.data.error) {
                    throw new Error(created.data?.message || "Erreur lors de la génération de la facture.");
                }

                toast.success("Facture générée avec succès");
                await queryClient.invalidateQueries({queryKey: ['billing', 'invoices']});
                await queryClient.invalidateQueries({queryKey: ['billing', 'analytics']});
            }
        });
    } catch (error) {
        console.error('Invoice Stepper Error:', error);
        toast.error("Erreur lors de la génération de la facture.");
    }
}
