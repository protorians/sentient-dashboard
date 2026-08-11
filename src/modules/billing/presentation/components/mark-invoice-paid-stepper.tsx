'use client';

import React from 'react';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {CreditCardIcon} from "lucide-react";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {InvoiceInterface} from "@/modules/billing/domain/invoice.interface";
import {PaymentMethodInterface} from "@/modules/billing/domain/payment-method.interface";
import {PAYMENT_METHOD_TYPE_LABELS} from "@/modules/billing/domain/enums/payment-method-type.enum";
import {QueryClient} from "@tanstack/react-query";
import {DropdownMenuItem} from "@/core/presentation/ui/dropdown-menu";

interface MarkInvoicePaidFormData {
    paymentMethodId?: string;
}

interface MarkInvoicePaidStepperProps {
    invoice: InvoiceInterface;
    paymentMethods: PaymentMethodInterface[];
    queryClient: QueryClient;
    children: React.ReactNode;
}

export function MarkInvoicePaidStepper({invoice, paymentMethods, queryClient, children}: MarkInvoicePaidStepperProps) {
    const openStepper = useModalStepper<MarkInvoicePaidFormData>({
        size: 'LG'
    });

    const activePaymentMethods = paymentMethods.filter(pm => pm.status !== false);

    return (
        <div onClick={() => handleOpen(openStepper, queryClient, invoice, activePaymentMethods)}>
            {children}
        </div>
    );
}

async function handleOpen(
    openStepper: ReturnType<typeof useModalStepper<MarkInvoicePaidFormData>>,
    queryClient: QueryClient,
    invoice: InvoiceInterface,
    activePaymentMethods: PaymentMethodInterface[],
) {
    const steps: ModalStepperStep<MarkInvoicePaidFormData>[] = [
        {
            id: 'payment',
            title: 'Encaissement',
            description: `Facture ${invoice.invoiceNumber}`,
            content: ({updateData, data}) => {
                const selectedPaymentMethod = activePaymentMethods.find(pm => pm.id === data.paymentMethodId);

                const computeFees = () => {
                    if (!selectedPaymentMethod) return {fee: 0, net: invoice.amount};
                    const fee = selectedPaymentMethod.feeAmount + (invoice.amount * selectedPaymentMethod.feeRate) / 100;
                    return {fee, net: invoice.amount - fee};
                };

                const {fee, net} = computeFees();

                return (
                    <div className="flex flex-col gap-4 max-w-lg mx-auto">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">Moyen de paiement</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={data.paymentMethodId || ''}
                                onChange={e => updateData({paymentMethodId: e.target.value || undefined})}
                            >
                                <option value="">Sélectionner (optionnel)</option>
                                {activePaymentMethods.map((pm) => (
                                    <option key={pm.id} value={pm.id}>
                                        {pm.name} ({PAYMENT_METHOD_TYPE_LABELS[pm.type] ?? pm.type})
                                    </option>
                                ))}
                            </select>
                            <span className="text-xs text-muted-foreground">
                                Si non précisé, le moyen de paiement de la commande sera utilisé.
                            </span>
                        </div>

                        <div className="p-3 bg-muted/40 rounded-lg flex flex-col gap-2">
                            <div className="flex justify-between text-sm">
                                <span>Montant facture</span>
                                <span className="font-semibold">{invoice.amount.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                            {selectedPaymentMethod && fee > 0 && (
                                <>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Frais ({selectedPaymentMethod.name})</span>
                                        <span>-{fee.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-semibold">
                                        <span>Net encaissé</span>
                                        <span>{net.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Confirmez l\'encaissement',
            content: ({data}) => {
                const pm = activePaymentMethods.find(p => p.id === data.paymentMethodId);
                const fee = pm ? pm.feeAmount + (invoice.amount * pm.feeRate) / 100 : 0;
                const net = invoice.amount - fee;

                return (
                    <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Encaissement</div>
                            <p><strong>Facture :</strong> {invoice.invoiceNumber}</p>
                            <p><strong>Montant :</strong> {invoice.amount.toLocaleString('fr-FR')} FCFA</p>
                            {pm && (
                                <>
                                    <p><strong>Moyen :</strong> {pm.name}</p>
                                    {fee > 0 && <p><strong>Frais :</strong> {fee.toLocaleString('fr-FR')} FCFA</p>}
                                </>
                            )}
                            <p><strong>Net encaissé :</strong> {net.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Une écriture comptable de paiement sera automatiquement générée.
                        </p>
                    </div>
                );
            }
        },
    ];

    try {
        await openStepper({
            steps,
            title: "Encaisser la facture",
            initialData: {},
            onEnd: async ({data}) => {
                const created = await BillingApiService.payInvoice(invoice.id, {
                    paymentMethodId: data.paymentMethodId,
                });

                if (!created.data?.data || created.data.error) {
                    throw new Error(created.data?.message || "Erreur lors du paiement.");
                }

                toast.success("Facture marquée comme payée");
                await queryClient.invalidateQueries({queryKey: ['billing', 'invoices']});
                await queryClient.invalidateQueries({queryKey: ['billing', 'orders']});
                await queryClient.invalidateQueries({queryKey: ['billing', 'analytics']});
            }
        });
    } catch (error) {
        console.error('Pay Invoice Stepper Error:', error);
        toast.error("Erreur lors de l'encaissement.");
    }
}
