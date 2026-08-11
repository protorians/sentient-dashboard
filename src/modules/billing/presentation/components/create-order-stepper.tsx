'use client';

import React, {Fragment} from 'react';
import {Button} from '@/core/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {PackageIcon, PlusIcon, TrashIcon} from "lucide-react";
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service";
import {CreateOrderItemInterface} from "@/modules/billing/domain/order.interface";
import {LegacyInput} from "@/core/presentation/ui/legacy-input";
import {FieldGroup} from "@/core/presentation/ui/field";
import {QueryClient} from "@tanstack/react-query";
import {cn} from "@/core/infrastructure/utilities/utils";
import {buttonVariants} from "@/core/presentation/ui/button";
import type {VariantProps} from "class-variance-authority";

interface CreateOrderFormData {
    items: CreateOrderItemInterface[];
    customerId?: string;
    paymentMethodId?: string;
}

export interface CreateOrderStepperProps {
    variant?: VariantProps<typeof buttonVariants>['variant'];
    size?: VariantProps<typeof buttonVariants>['size'];
    label?: string;
    className?: string;
    queryClient: QueryClient;
}

export function CreateOrderStepper({variant = "default", size = "lg", label, className, queryClient}: CreateOrderStepperProps) {
    const openStepper = useModalStepper<CreateOrderFormData>({
        size: 'XL'
    });

    return (
        <Button onClick={() => handleOpen(openStepper, queryClient)} variant={variant} size={size} className={className}>
            <PlusIcon/>
            {label ?? 'Nouvelle commande'}
        </Button>
    );
}

async function handleOpen(
    openStepper: ReturnType<typeof useModalStepper<CreateOrderFormData>>,
    queryClient: QueryClient,
) {
    const steps: ModalStepperStep<CreateOrderFormData>[] = [
        {
            id: 'items',
            required: true,
            title: 'Articles',
            description: 'Ajoutez les articles de la commande',
            content: ({updateData, data}) => {
                const items = data.items || [{description: '', quantity: 1, unitPrice: 0}];

                const addItem = () => {
                    updateData({items: [...items, {description: '', quantity: 1, unitPrice: 0}]});
                };

                const removeItem = (index: number) => {
                    if (items.length <= 1) return;
                    updateData({items: items.filter((_, i) => i !== index)});
                };

                const updateItem = (index: number, field: keyof CreateOrderItemInterface, value: string | number) => {
                    const updated = [...items];
                    updated[index] = {...updated[index], [field]: value};
                    updateData({items: updated});
                };

                const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

                return (
                    <div className="flex flex-col gap-4 max-w-lg mx-auto">
                        {items.map((item, index) => (
                            <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Article {index + 1}</span>
                                    {items.length > 1 && (
                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => removeItem(index)} type="button">
                                            <TrashIcon className="size-4"/>
                                        </Button>
                                    )}
                                </div>
                                <FieldGroup className="gap-3">
                                    <LegacyInput
                                        id={`item-desc-${index}`}
                                        label="Description"
                                        input={{
                                            required: true,
                                            type: "text",
                                            placeholder: "Nom du produit ou service",
                                            value: item.description,
                                            onChange: e => updateItem(index, 'description', e.target.value),
                                        }}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <LegacyInput
                                            id={`item-qty-${index}`}
                                            label="Quantité"
                                            input={{
                                                type: "number",
                                                min: 1,
                                                value: String(item.quantity),
                                                onChange: e => updateItem(index, 'quantity', Number(e.target.value) || 1),
                                            }}
                                        />
                                        <LegacyInput
                                            id={`item-price-${index}`}
                                            label="Prix unitaire"
                                            input={{
                                                type: "number",
                                                min: 0,
                                                step: "0.01",
                                                placeholder: "0",
                                                value: String(item.unitPrice),
                                                onChange: e => updateItem(index, 'unitPrice', Number(e.target.value) || 0),
                                            }}
                                        />
                                    </div>
                                </FieldGroup>
                                <div className="text-right text-sm text-muted-foreground">
                                    Sous-total : {(item.quantity * item.unitPrice).toLocaleString('fr-FR')} FCFA
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" onClick={addItem} type="button" className="w-full">
                            <PlusIcon className="size-4"/>
                            Ajouter un article
                        </Button>

                        {totalAmount > 0 && (
                            <div className="flex items-center justify-between px-3 py-2 bg-muted/40 rounded-lg">
                                <span className="font-semibold">Total</span>
                                <span className="font-bold text-lg">
                                    {totalAmount.toLocaleString('fr-FR')} FCFA
                                </span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Vérifiez les informations avant création',
            content: ({data}) => {
                const items = data.items || [];
                const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

                return (
                    <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Commande</div>
                            <p><strong>Nombre d'articles :</strong> {items.length}</p>
                            <p><strong>Total :</strong> {total.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Articles</div>
                            {items.map((item, i) => (
                                <div key={i} className="flex justify-between py-1">
                                    <span>{item.description || 'N/A'} ({item.quantity})</span>
                                    <span className="font-medium">{(item.quantity * item.unitPrice).toLocaleString('fr-FR')} FCFA</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
        },
    ];

    try {
        await openStepper({
            steps,
            title: "Nouvelle commande",
            initialData: {items: [{description: '', quantity: 1, unitPrice: 0}]},
            onEnd: async ({data}) => {
                const validItems = (data.items || []).filter(item => item.description.trim() && item.quantity > 0);

                if (validItems.length === 0) {
                    throw new Error("Veuillez ajouter au moins un article valide.");
                }

                const created = await BillingApiService.createOrder({items: validItems});

                if (!created.data?.data || created.data.error) {
                    throw new Error(created.data?.message || "Erreur lors de la création de la commande.");
                }

                toast.success("Commande créée avec succès");
                await queryClient.invalidateQueries({queryKey: ['billing', 'orders']});
            }
        });
    } catch (error) {
        console.error('Order Stepper Error:', error);
        toast.error("Erreur lors de la création de la commande.");
    }
}
