'use client';

import React, {Fragment} from 'react';
import {Button} from '@/core/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {PlusIcon, StoreIcon, } from "lucide-react";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {CreateWarehouseInterface} from "@/modules/stock/domain/warehouse.interface";
import {WarehouseTypeEnum} from "@/modules/beverage-sales/domain/enums/warehouse-type.enum";
import {LegacyInput} from "@/core/presentation/ui/legacy-input";
import {LegacySelectInput} from "@/core/presentation/ui/legacy-select-input";
import {FieldGroup} from "@/core/presentation/ui/field";
import {useQueryClient} from "@tanstack/react-query";
import {cn} from "@/core/infrastructure/utilities/utils";
import {buttonVariants} from "@/core/presentation/ui/button";
import type {VariantProps} from "class-variance-authority";

export interface CreateWarehouseStepperProps {
    variant?: VariantProps<typeof buttonVariants>['variant'];
    size?: VariantProps<typeof buttonVariants>['size'];
    label?: string;
    className?: string;
}

export function CreateWarehouseStepper({variant = "default", size = "lg", label, className}: CreateWarehouseStepperProps) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<CreateWarehouseInterface>({
        size: 'XL'
    });

    const handleOpenStepper = async () => {
        const steps: ModalStepperStep<CreateWarehouseInterface>[] = [
            {
                id: 'details',
                required: true,
                title: 'Informations',
                description: 'Nom et adresse de l\'emplacement',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacyInput
                            id="name"
                            label="Nom de l'emplacement"
                            description="Ex: Pharmacie Centrale, Restaurant Le Jardin, Dépôt Principal"
                            input={{
                                required: true,
                                type: "text",
                                placeholder: "Pharmacie Centrale",
                                value: data.name || '',
                                onChange: e => updateData({name: e.target.value}),
                            }}
                            icon={<StoreIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacySelectInput
                            id="type"
                            label="Type d'emplacement"
                            placeholder="Sélectionner le type"
                            required
                            value={data.type || ''}
                            onValueChange={(value) => updateData({type: value as WarehouseTypeEnum})}
                            options={[
                                {value: WarehouseTypeEnum.PHARMACY, label: 'Pharmacie'},
                                {value: WarehouseTypeEnum.RESTAURANT, label: 'Restaurant'},
                                {value: WarehouseTypeEnum.DEPOT, label: 'Dépôt'},
                            ]}
                            icon={<StoreIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="address"
                            label="Adresse"
                            description="Adresse physique de l'emplacement (optionnel)"
                            input={{
                                type: "text",
                                placeholder: "123 Avenue de la République",
                                value: data.address || '',
                                onChange: e => updateData({address: e.target.value}),
                            }}
                            icon={<StoreIcon className="size-4 text-muted-foreground/60"/>}
                        />
                    </FieldGroup>
                )
            },
            {
                id: 'confirmation',
                title: 'Confirmation',
                description: 'Vérifiez les informations avant la création',
                content: ({data}) => (
                    <div>
                        <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                            <div>
                                <div className="text-lg font-bold border-b pb-1 mb-2">Emplacement</div>
                                <p><strong>Nom :</strong> {data.name || 'N/A'}</p>
                                <p><strong>Type :</strong> {data.type === WarehouseTypeEnum.PHARMACY ? 'Pharmacie' : data.type === WarehouseTypeEnum.RESTAURANT ? 'Restaurant' : data.type === WarehouseTypeEnum.DEPOT ? 'Dépôt' : 'N/A'}</p>
                                <p><strong>Adresse :</strong> {data.address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )
            },
        ];

        try {
            await openStepper({
                steps,
                title: "Créer un emplacement",
                initialData: {type: WarehouseTypeEnum.PHARMACY} as any,
                onEnd: async ({data}) => {
                    const created = await StockApiService.createWarehouse({
                        name: data.name || '',
                        address: data.address,
                        type: data.type || WarehouseTypeEnum.PHARMACY,
                    });

                    if (!created.data?.data || created.data.error) {
                        throw new Error(created.data?.message || "Une erreur est survenue lors de la création de l'emplacement.");
                    }

                    await queryClient.invalidateQueries({queryKey: ['stock', 'warehouses']});
                    toast.success(`Emplacement "${data.name}" créé avec succès`);
                }
            });
        } catch (error) {
            console.error('Stepper Error:', error);
            toast.error("Une erreur est survenue lors de la création de l'emplacement.");
        }
    };

    return (
        <Button onClick={handleOpenStepper} variant={variant} size={size} className={className}>
            <PlusIcon/>
            {label || "Ajouter un emplacement"}
        </Button>
    );
}

export function CreateWarehouseInlineButton({className}: { className?: string }) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<CreateWarehouseInterface>({
        size: 'XL'
    });

    const handleOpen = async () => {
        try {
            await openStepper({
                steps: [
                    {
                        id: 'details',
                        required: true,
                        title: 'Informations',
                        description: 'Nom et adresse de l\'emplacement',
                        content: ({updateData, data}) => (
                            <FieldGroup className="gap-4 max-w-lg mx-auto">
                                <LegacyInput
                                    id="name"
                                    label="Nom de l'emplacement"
                                    input={{
                                        required: true,
                                        type: "text",
                                        placeholder: "Pharmacie Centrale",
                                        value: data.name || '',
                                        onChange: e => updateData({name: e.target.value}),
                                    }}
                                    icon={<StoreIcon className="size-4 text-muted-foreground/60"/>}
                                />
                                <LegacySelectInput
                                    id="type"
                                    label="Type d'emplacement"
                                    placeholder="Sélectionner le type"
                                    required
                                    value={data.type || ''}
                                    onValueChange={(value) => updateData({type: value as WarehouseTypeEnum})}
                                    options={[
                                        {value: WarehouseTypeEnum.PHARMACY, label: 'Pharmacie'},
                                        {value: WarehouseTypeEnum.RESTAURANT, label: 'Restaurant'},
                                        {value: WarehouseTypeEnum.DEPOT, label: 'Dépôt'},
                                    ]}
                                    icon={<StoreIcon className="size-4 text-muted-foreground/60"/>}
                                />
                            </FieldGroup>
                        )
                    },
                ],
                title: "Créer un emplacement",
                initialData: {type: WarehouseTypeEnum.PHARMACY} as any,
                onEnd: async ({data}) => {
                    const created = await StockApiService.createWarehouse({
                        name: data.name || '',
                        type: data.type || WarehouseTypeEnum.PHARMACY,
                    });
                    if (!created.data?.data || created.data.error) {
                        throw new Error(created.data?.message || "Erreur");
                    }
                    await queryClient.invalidateQueries({queryKey: ['stock', 'warehouses']});
                    toast.success(`Emplacement "${data.name}" créé`);
                }
            });
        } catch {
            // User cancelled
        }
    };

    return (
        <Button onClick={handleOpen} variant="secondary" size="sm" className={cn("gap-2", className)}>
            <PlusIcon className="size-3"/>
            Créer un emplacement
        </Button>
    );
}
