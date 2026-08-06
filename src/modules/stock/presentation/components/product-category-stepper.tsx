'use client';

import React, {Fragment} from 'react';
import {Button} from '@/core/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {FolderTreeIcon, PencilIcon, PlusIcon} from "lucide-react";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {
    CreateProductCategoryInterface,
    ProductCategoryInterface,
} from "@/modules/stock/domain/product-category.interface";
import {LegacyInput} from "@/core/presentation/ui/legacy-input";
import {FieldGroup} from "@/core/presentation/ui/field";
import {Textarea} from "@/core/presentation/ui/textarea";
import {Switch} from "@/core/presentation/ui/switch";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {VariantProps} from "class-variance-authority";
import {buttonVariants} from "@/core/presentation/ui/button";

export interface ProductCategoryStepperProps {
    category?: ProductCategoryInterface | null;
}

export interface ProductCategoryFormInterface extends CreateProductCategoryInterface {
    status?: boolean;
}

export function ProductCategoryStepper({category}: ProductCategoryStepperProps) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<ProductCategoryFormInterface>({
        size: 'XXL'
    });

    const isEditing = !!category?.id;

    const handleOpenStepper = async () => {
        const initialData: Partial<ProductCategoryFormInterface> = category
            ? {name: category.name, description: category.description || '', status: category.status}
            : {};

        const steps: ModalStepperStep<ProductCategoryFormInterface>[] = [
            {
                id: 'details',
                required: true,
                title: 'Informations',
                description: isEditing ? 'Modifier la catégorie' : 'Nom et description',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacyInput
                            id="name"
                            label="Nom de la catégorie"
                            description="Nom affiché dans le catalogue."
                            input={{
                                required: true,
                                type: "text",
                                placeholder: "Alimentaire",
                                value: data.name || '',
                                onChange: e => updateData({name: e.target.value}),
                            }}
                            icon={<FolderTreeIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea
                                value={data.description || ''}
                                onChange={(e) => updateData({description: e.target.value})}
                                placeholder="Description de la catégorie"
                                rows={3}
                            />
                        </div>
                        {isEditing && (
                            <div className="flex flex-row items-center justify-between gap-4 rounded-md border border-border/50 bg-muted/20 px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Catégorie active</span>
                                    <span className="text-xs text-muted-foreground">
                                        Les catégories inactives sont masquées du catalogue
                                    </span>
                                </div>
                                <Switch
                                    checked={data.status !== false}
                                    onCheckedChange={(checked) => updateData({status: checked})}
                                />
                            </div>
                        )}
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
                                <div className="text-lg font-bold border-b pb-1 mb-2">Catégorie</div>
                                <p><strong>Nom :</strong> {data.name || 'N/A'}</p>
                                <p><strong>Description :</strong> {data.description || 'N/A'}</p>
                                {isEditing && (
                                    <p><strong>Statut :</strong> {data.status === false ? 'Inactif' : 'Actif'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            },
        ];

        try {
            await openStepper({
                steps,
                title: isEditing ? "Modifier la catégorie" : "Nouvelle catégorie de produits",
                initialData,
                onEnd: async ({data}) => {
                    if (isEditing && category?.id) {
                        const updated = await StockApiService.updateProductCategory(category.id, {
                            name: data.name,
                            description: data.description,
                            status: data.status,
                        });

                        if (!updated.data?.data || updated.data.error) {
                            throw new Error(updated.data?.message || "Une erreur est survenue lors de la mise à jour de la catégorie.");
                        }

                        toast.success(`Catégorie ${data.name || ''} mise à jour avec succès`);
                    } else {
                        const created = await StockApiService.createProductCategory({
                            name: data.name || '',
                            description: data.description,
                        });

                        if (!created.data?.data || created.data.error) {
                            throw new Error(created.data?.message || "Une erreur est survenue lors de la création de la catégorie.");
                        }

                        toast.success(`Catégorie ${data.name || ''} créée avec succès`);
                    }

                    await queryClient.invalidateQueries({queryKey: ['stock', 'categories']});
                }
            });
        } catch (error) {
            console.error('Category Stepper Error:', error);
            toast.error("Une erreur est survenue lors de l'enregistrement de la catégorie.");
        }
    };

    return (
        <Fragment>
            <Button onClick={handleOpenStepper} variant={"outline"} size="lg">
                {isEditing ? <PencilIcon className="size-4"/> : <PlusIcon/>}
                {isEditing ? 'Modifier' : 'Nouvelle catégorie'}
            </Button>
        </Fragment>
    );
}
