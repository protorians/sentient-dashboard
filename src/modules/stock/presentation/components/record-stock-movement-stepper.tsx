'use client';

import React, {useEffect} from 'react';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {
    ArrowDownToLineIcon,
    ArrowUpFromLineIcon,
    HashIcon,
    RotateCcwIcon,
    Undo2Icon,
} from "lucide-react";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {CreateStockMovementInterface, MovementUnitEnum} from "@/modules/stock/domain/stock-movement.interface";
import {StockMovementTypeEnum} from "@/modules/stock/domain/enums/stock-movement-type.enum";
import {LegacyInput} from "@/core/presentation/ui/legacy-input";
import {LegacySelectInput} from "@/core/presentation/ui/legacy-select-input";
import {FieldGroup} from "@/core/presentation/ui/field";
import {QueryClient} from "@tanstack/react-query";
import {useQuery} from "@tanstack/react-query";
import {WarehouseInterface} from "@/modules/stock/domain/warehouse.interface";
import {CreateWarehouseInlineButton} from "@/modules/stock/presentation/components/create-warehouse-stepper";
import {StoreIcon} from "lucide-react";

export interface RecordStockMovementStepperProps {
    product: ProductInterface;
    queryClient: QueryClient;
    onClose?: () => void;
}

export function RecordStockMovementStepper({product, queryClient, onClose}: RecordStockMovementStepperProps) {
    const openStepper = useModalStepper<CreateStockMovementInterface>({
        size: 'XXL'
    });

    const {data: warehouses} = useQuery<WarehouseInterface[]>({
        queryKey: ['stock', 'warehouses'],
        queryFn: async () => {
            const response = await StockApiService.getWarehouses();
            return response.data?.data || [];
        },
    });

    useEffect(() => {
        if (!product?.id) return;

        const steps: ModalStepperStep<CreateStockMovementInterface>[] = [
            {
                id: 'type',
                required: true,
                title: 'Type de mouvement',
                description: 'Nature de l\'opération',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacySelectInput
                            id="type"
                            label="Type de mouvement"
                            placeholder="Sélectionner"
                            required
                            value={data.type || ''}
                            onValueChange={(value) => updateData({type: value as StockMovementTypeEnum})}
                            options={[
                                {value: StockMovementTypeEnum.IN, label: 'Entrée'},
                                {value: StockMovementTypeEnum.OUT, label: 'Sortie'},
                                {value: StockMovementTypeEnum.ADJUSTMENT, label: 'Ajustement'},
                                {value: StockMovementTypeEnum.RETURN, label: 'Retour'},
                                {value: StockMovementTypeEnum.TRANSFER, label: 'Transfert'},
                            ]}
                            icon={<ArrowDownToLineIcon className="size-4 text-muted-foreground/60"/>}
                        />
                    </FieldGroup>
                )
            },
            {
                id: 'location',
                required: true,
                title: 'Emplacement',
                description: 'Emplacement où le mouvement sera enregistré',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        {(!warehouses || warehouses.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed gap-3">
                                <StoreIcon className="size-8 text-muted-foreground/30"/>
                                <span className="text-sm text-muted-foreground italic">
                                    Aucun emplacement disponible. Créez d'abord un emplacement.
                                </span>
                                <CreateWarehouseInlineButton/>
                            </div>
                        ) : (
                            <LegacySelectInput
                                id="locationId"
                                label="Emplacement"
                                description={data.type === StockMovementTypeEnum.TRANSFER ? 'Emplacement source du transfert' : 'Emplacement cible du mouvement'}
                                placeholder="Sélectionner"
                                required
                                value={data.locationId || ''}
                                onValueChange={(value) => updateData({locationId: value})}
                                options={warehouses.map(w => ({value: w.id, label: `${w.name} (${w.type})`}))}
                                icon={<ArrowDownToLineIcon className="size-4 text-muted-foreground/60"/>}
                            />
                        )}
                    </FieldGroup>
                )
            },
            {
                id: 'quantity',
                required: true,
                title: 'Quantité & unité',
                description: 'Quantité déplacée, unité et justification',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacyInput
                            id="quantity"
                            label="Quantité"
                            description="Quantité concernée par ce mouvement."
                            input={{
                                required: true,
                                type: "number",
                                min: 0,
                                placeholder: "10",
                                value: data.quantity != null ? String(data.quantity) : '',
                                onChange: e => updateData({quantity: Number(e.target.value) || undefined}),
                            }}
                            icon={<HashIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacySelectInput
                            id="unit"
                            label="Unité"
                            description="Unité de mesure pour ce mouvement."
                            placeholder="Unité"
                            value={data.unit || MovementUnitEnum.UNIT}
                            onValueChange={(value) => updateData({unit: value as MovementUnitEnum})}
                            options={[
                                {value: MovementUnitEnum.UNIT, label: 'Unité'},
                                {value: MovementUnitEnum.PACK, label: 'Pack'},
                                {value: MovementUnitEnum.CASE, label: 'Casier'},
                            ]}
                            icon={<HashIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="reason"
                            label="Motif"
                            description="Motif de ce mouvement de stock."
                            input={{
                                type: "text",
                                placeholder: "Réapprovisionnement fournisseur",
                                value: data.reason || '',
                                onChange: e => updateData({reason: e.target.value}),
                            }}
                            icon={<RotateCcwIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <div className="flex flex-col gap-1.5 rounded-md border border-border/50 bg-muted/20 px-4 py-3">
                            <span className="text-xs text-muted-foreground">Produit</span>
                            <span className="text-sm font-medium">{product.name}</span>
                        </div>
                    </FieldGroup>
                )
            },
            {
                id: 'confirmation',
                title: 'Confirmation',
                description: 'Vérifiez les informations avant l\'enregistrement',
                content: ({data}) => (
                    <div className={''}>
                        <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                            <div>
                                <div className="text-lg font-bold border-b pb-1 mb-2">Mouvement</div>
                                <p><strong>Produit :</strong> {product.name}</p>
                                <p><strong>Type :</strong> {data.type === StockMovementTypeEnum.IN ? 'Entrée' : data.type === StockMovementTypeEnum.OUT ? 'Sortie' : data.type === StockMovementTypeEnum.ADJUSTMENT ? 'Ajustement' : data.type === StockMovementTypeEnum.RETURN ? 'Retour' : data.type === StockMovementTypeEnum.TRANSFER ? 'Transfert' : 'N/A'}</p>
                                <p><strong>Emplacement :</strong> {warehouses?.find(w => w.id === data.locationId)?.name || data.locationId || 'N/A'}</p>
                                <p><strong>Quantité :</strong> {data.quantity != null ? data.quantity : 'N/A'}{data.unit ? ` (${data.unit === MovementUnitEnum.UNIT ? 'Unité' : data.unit === MovementUnitEnum.PACK ? 'Pack' : 'Casier'})` : ''}</p>
                                <p><strong>Motif :</strong> {data.reason || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )
            },
        ];

        let closed = false;
        openStepper({
            steps,
            title: "Enregistrer un mouvement de stock",
            initialData: {productId: product.id},
            onEnd: async ({data}) => {
                if (!data.locationId) {
                    throw new Error("Un emplacement est obligatoire pour enregistrer un mouvement.");
                }
                const created = await StockApiService.createMovement({
                    productId: product.id!,
                    type: data.type || StockMovementTypeEnum.ADJUSTMENT,
                    quantity: data.quantity || 0,
                    unit: data.unit,
                    reason: data.reason,
                    locationId: data.locationId,
                });

                if (!created.data?.data || created.data.error) {
                    throw new Error(created.data?.message || "Une erreur est survenue lors de l'enregistrement du mouvement.");
                }

                await queryClient.invalidateQueries({queryKey: ['stock', 'products']});
                toast.success(`Mouvement enregistré avec succès pour le produit ${product.name}`);
            },
            onCancel: () => {
                closed = true;
                onClose?.();
            }
        }).then(() => {
            if (!closed) onClose?.();
        }).catch(() => {
            onClose?.();
        });
    }, [product]);

    return null;
}
