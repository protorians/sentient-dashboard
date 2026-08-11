'use client';

import React, {Fragment} from 'react';
import {Button} from '@/core/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {FolderIcon, CheckCircleIcon, PlusIcon, PencilIcon} from "lucide-react";
import {BloggingApiService} from "@/modules/blogging/application/service/blogging-api-service";
import {CategoryVm, CreateCategoryInterface} from "@/modules/blogging/domain/blogging.interface";
import {Input} from "@/core/presentation/ui/input";
import {Textarea} from "@/core/presentation/ui/textarea";
import {Label} from "@/core/presentation/ui/label";
import {useQueryClient} from "@tanstack/react-query";

interface ManageCategoryStepperProps {
    category?: CategoryVm | null;
    children: React.ReactNode;
}

export function ManageCategoryStepper({category, children}: ManageCategoryStepperProps) {
    const isEditing = !!category;
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<CreateCategoryInterface>({
        size: 'MD'
    });

    const getSteps = (): ModalStepperStep<CreateCategoryInterface>[] => [
        {
            id: 'info',
            required: true,
            title: 'Informations',
            description: 'Détails de la catégorie',
            content: ({updateData, data}) => (
                <div className="space-y-6 max-w-lg mx-auto">
                    <div className="grid gap-2">
                        <Label htmlFor="stepper-cat-title">Nom *</Label>
                        <Input
                            id="stepper-cat-title"
                            required
                            value={data.title || ''}
                            onChange={e => updateData({title: e.target.value})}
                            placeholder="Nom de la catégorie"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stepper-cat-desc">Description</Label>
                        <Textarea
                            id="stepper-cat-desc"
                            value={data.description || ''}
                            onChange={e => updateData({description: e.target.value})}
                            placeholder="Description (optionnelle)"
                            rows={3}
                        />
                    </div>
                </div>
            )
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Récapitulatif',
            content: ({data}) => (
                <div className="max-w-lg mx-auto">
                    <div className="flex flex-col gap-y-4 p-6 bg-muted/30 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <FolderIcon className="size-8 text-primary"/>
                            <div>
                                <h3 className="text-lg font-semibold">{data.title || 'N/A'}</h3>
                                {data.description && (
                                    <p className="text-sm text-muted-foreground">{data.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="border-t pt-3">
                            <p className="text-xs text-muted-foreground">
                                {isEditing
                                    ? "La catégorie sera mise à jour avec ces informations."
                                    : "La catégorie sera créée et disponible pour tous les articles."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
    ];

    const handleOpenStepper = async () => {
        try {
            const initialData = category ? {
                title: category.title || '',
                description: category.description || '',
            } : {};

            await openStepper({
                steps: getSteps(),
                title: isEditing ? "Modifier la catégorie" : "Nouvelle catégorie",
                initialData,
                onEnd: async ({data}) => {
                    if (!data.title?.trim()) {
                        throw new Error("Le nom de la catégorie est requis.");
                    }
                    if (isEditing && category) {
                        await BloggingApiService.updateCategory(category.id, {
                            title: data.title!.trim(),
                            description: data.description?.trim() || undefined,
                        });
                        toast.success("Catégorie modifiée");
                    } else {
                        await BloggingApiService.createCategory({
                            title: data.title!.trim(),
                            description: data.description?.trim() || undefined,
                        });
                        toast.success("Catégorie créée");
                    }
                    queryClient.invalidateQueries({queryKey: ['blog']});
                }
            });
        } catch (error) {
            console.error('Category stepper error:', error);
        }
    };

    return (
        <Fragment>
            {React.cloneElement(children as React.ReactElement<any>, {
                onClick: handleOpenStepper
            })}
        </Fragment>
    );
}

export function CreateCategoryStepper() {
    return (
        <ManageCategoryStepper>
            <Button size="sm" variant="outline">
                <PlusIcon className="size-4 mr-2"/>
                Nouvelle catégorie
            </Button>
        </ManageCategoryStepper>
    );
}

export function EditCategoryStepper({category, children}: { category: CategoryVm; children: React.ReactNode }) {
    return (
        <ManageCategoryStepper category={category}>
            {children}
        </ManageCategoryStepper>
    );
}
