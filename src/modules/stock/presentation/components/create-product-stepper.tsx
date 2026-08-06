'use client';

import React, {Fragment} from 'react';
import {Button} from '@/core/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@/core/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {
    BoxIcon,
    LinkIcon,
    PackageIcon,
    PlusIcon,
    RulerIcon,
    ScaleIcon,
    TagsIcon,
    FolderTreeIcon,
} from "lucide-react";
import {useAuth} from "@/modules/auth/infrastructure/hooks/use-auth";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {CreateProductInterface} from "@/modules/stock/domain/product.interface";
import {ProductTypeEnum} from "@/modules/stock/domain/enums/product-type.enum";
import {LegacyInput} from "@/core/presentation/ui/legacy-input";
import {LegacySelectInput} from "@/core/presentation/ui/legacy-select-input";
import {FieldGroup} from "@/core/presentation/ui/field";
import {Textarea} from "@/core/presentation/ui/textarea";
import {Switch} from "@/core/presentation/ui/switch";
import {Checkbox} from "@/core/presentation/ui/checkbox";
import {useQuery} from "@tanstack/react-query";
import {ProductCategoryInterface} from "@/modules/stock/domain/product-category.interface";
import {Waiting} from "@/core/presentation/waiting";

function CategoriesStepContent({value, onValueChange}: {
    value: string[];
    onValueChange: (categoryIds: string[]) => void;
}) {
    const {currentOrganization} = useAuth();
    const {data: categories, isLoading} = useQuery<ProductCategoryInterface[]>({
        queryKey: ['stock', 'categories', 'select'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const responses = await StockApiService.getProductCategories();
            return responses.data?.data || [];
        },
    });

    const toggle = (id: string) => {
        const next = value.includes(id)
            ? value.filter(v => v !== id)
            : [...value, id];
        onValueChange(next);
    };

    if (isLoading) {
        return <Waiting label={"Chargement des catégories..."}/>;
    }

    if (!categories?.length) {
        return (
            <div
                className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed gap-2">
                <FolderTreeIcon className="size-8 text-muted-foreground/30"/>
                <span className="text-sm text-muted-foreground italic">
                    Aucune catégorie disponible. Créez d'abord une catégorie.
                </span>
            </div>
        )
    }

    return (
        <div className="divide-y divide-border/50 border border-border/50 rounded-lg max-h-64 overflow-y-auto">
            {categories.map((category) => (
                <div
                    key={category.id}
                    className="flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => toggle(category.id!)}
                >
                    <Checkbox
                        checked={value.includes(category.id!)}
                        onCheckedChange={() => toggle(category.id!)}
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium">{category.name}</span>
                        {category.description && (
                            <span className="text-xs text-muted-foreground truncate">{category.description}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function SelectedCategories({categoryIds}: { categoryIds: string[] }) {
    const {currentOrganization} = useAuth();
    const {data: categories} = useQuery<ProductCategoryInterface[]>({
        queryKey: ['stock', 'categories', 'select'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const responses = await StockApiService.getProductCategories();
            return responses.data?.data || [];
        },
    });

    if (!categoryIds?.length) return <p>Aucune catégorie sélectionnée</p>;

    const selected = categories?.filter(category => categoryIds.includes(category.id!)) || [];

    if (!selected.length) return <p>{categoryIds.length} catégorie(s) sélectionnée(s)</p>;

    return <p>{selected.map(category => category.name).join(', ')}</p>;
}

export function CreateProductStepper() {
    const {currentOrganization} = useAuth();
    const openStepper = useModalStepper<CreateProductInterface>({
        size: 'XXL'
    });

    const handleOpenStepper = async () => {
        const steps: ModalStepperStep<CreateProductInterface>[] = [
            {
                id: 'identification',
                required: true,
                title: 'Identification',
                description: 'Nom et référence du produit',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacyInput
                            id="name"
                            label="Nom du produit"
                            description="Le nom tel qu'il apparaîtra dans l'inventaire."
                            input={{
                                required: true,
                                type: "text",
                                placeholder: "Sac de riz 25kg",
                                value: data.name || '',
                                onChange: e => updateData({name: e.target.value}),
                            }}
                            icon={<PackageIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="sku"
                            label="Référence (SKU)"
                            description="Référence unique pour identifier le produit en interne."
                            input={{
                                type: "text",
                                placeholder: "RIZ-25KG-001",
                                value: data.sku || '',
                                onChange: e => updateData({sku: e.target.value}),
                            }}
                            icon={<TagsIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea
                                value={data.description || ''}
                                onChange={(e) => updateData({description: e.target.value})}
                                placeholder="Description détaillée du produit"
                                rows={3}
                            />
                        </div>
                    </FieldGroup>
                )
            },
            {
                id: 'characteristics',
                required: true,
                title: 'Caractéristiques',
                description: 'Type et nature du produit',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacySelectInput
                            id="type"
                            label="Type de produit"
                            placeholder="Sélectionner"
                            required
                            value={data.type || ''}
                            onValueChange={(value) => updateData({type: value as ProductTypeEnum})}
                            options={[
                                {value: ProductTypeEnum.PHYSICAL, label: 'Physique'},
                                {value: ProductTypeEnum.DIGITAL, label: 'Numérique'},
                            ]}
                            icon={<PackageIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <div
                            className="flex flex-row items-center justify-between gap-4 rounded-md border border-border/50 bg-muted/20 px-4 py-3">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Produit périssable</span>
                                <span className="text-xs text-muted-foreground">
                                    Indique si le produit a une date de péremption
                                </span>
                            </div>
                            <Switch
                                checked={data.isPerishable || false}
                                onCheckedChange={(checked) => updateData({isPerishable: checked})}
                            />
                        </div>
                    </FieldGroup>
                )
            },
            {
                id: 'categories',
                title: 'Catégories',
                description: 'Classez le produit dans une ou plusieurs catégories',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <CategoriesStepContent
                            value={data.categoryIds || []}
                            onValueChange={(categoryIds) => updateData({categoryIds})}
                        />
                    </FieldGroup>
                )
            },
            {
                id: 'specifics',
                title: 'Informations spécifiques',
                description: 'Données selon le type de produit',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        {data.type === ProductTypeEnum.PHYSICAL && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <LegacyInput
                                    id="weight"
                                    label="Poids (kg)"
                                    input={{
                                        type: "number",
                                        placeholder: "25",
                                        value: data.physicalData?.weight != null ? String(data.physicalData.weight) : '',
                                        onChange: e => updateData({
                                            physicalData: {...data.physicalData, weight: Number(e.target.value) || undefined}
                                        }),
                                    }}
                                    icon={<ScaleIcon className="size-4 text-muted-foreground/60"/>}
                                />
                                <LegacyInput
                                    id="barcode"
                                    label="Code-barres"
                                    input={{
                                        type: "text",
                                        placeholder: "9780201379624",
                                        value: data.physicalData?.barcode || '',
                                        onChange: e => updateData({physicalData: {...data.physicalData, barcode: e.target.value}}),
                                    }}
                                    icon={<RulerIcon className="size-4 text-muted-foreground/60"/>}
                                />
                                <LegacyInput
                                    id="dimensions"
                                    label="Dimensions"
                                    input={{
                                        type: "text",
                                        placeholder: "40x30x25 cm",
                                        value: data.physicalData?.dimensions || '',
                                        onChange: e => updateData({physicalData: {...data.physicalData, dimensions: e.target.value}}),
                                    }}
                                    icon={<RulerIcon className="size-4 text-muted-foreground/60"/>}
                                />
                            </div>
                        )}
                        {data.type === ProductTypeEnum.DIGITAL && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <LegacyInput
                                    id="downloadUrl"
                                    label="URL de téléchargement"
                                    input={{
                                        type: "text",
                                        placeholder: "https://...",
                                        value: data.digitalData?.downloadUrl || '',
                                        onChange: e => updateData({digitalData: {...data.digitalData, downloadUrl: e.target.value}}),
                                    }}
                                    icon={<LinkIcon className="size-4 text-muted-foreground/60"/>}
                                />
                                <LegacyInput
                                    id="mimeType"
                                    label="Type MIME"
                                    input={{
                                        type: "text",
                                        placeholder: "application/pdf",
                                        value: data.digitalData?.mimeType || '',
                                        onChange: e => updateData({digitalData: {...data.digitalData, mimeType: e.target.value}}),
                                    }}
                                    icon={<BoxIcon className="size-4 text-muted-foreground/60"/>}
                                />
                                <LegacyInput
                                    id="fileSize"
                                    label="Taille du fichier (octets)"
                                    input={{
                                        type: "number",
                                        placeholder: "2048",
                                        value: data.digitalData?.fileSize != null ? String(data.digitalData.fileSize) : '',
                                        onChange: e => updateData({digitalData: {...data.digitalData, fileSize: Number(e.target.value) || undefined}}),
                                    }}
                                    icon={<RulerIcon className="size-4 text-muted-foreground/60"/>}
                                />
                            </div>
                        )}
                        {!data.type && (
                            <p className="text-sm text-muted-foreground">Sélectionnez d'abord un type de produit.</p>
                        )}
                    </FieldGroup>
                )
            },
            {
                id: 'confirmation',
                title: 'Confirmation',
                description: 'Vérifiez les informations avant la création',
                content: ({data}) => (
                    <div className={''}>
                        <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                            <div>
                                <div className="text-lg font-bold border-b pb-1 mb-2">Identification</div>
                                <p><strong>Nom :</strong> {data.name || 'N/A'}</p>
                                <p><strong>Référence :</strong> {data.sku || 'N/A'}</p>
                                <p><strong>Description :</strong> {data.description || 'N/A'}</p>
                            </div>
                            <div>
                                <div className="text-lg font-bold border-b pb-1 mb-2">Caractéristiques</div>
                                <p><strong>Type :</strong> {data.type === ProductTypeEnum.PHYSICAL ? 'Physique' : data.type === ProductTypeEnum.DIGITAL ? 'Numérique' : 'N/A'}</p>
                                <p><strong>Périssable :</strong> {data.isPerishable ? 'Oui' : 'Non'}</p>
                            </div>
                            <div>
                                <div className="text-lg font-bold border-b pb-1 mb-2">Catégories</div>
                                <SelectedCategories categoryIds={data.categoryIds || []}/>
                            </div>
                            {data.type === ProductTypeEnum.PHYSICAL && (
                                <div>
                                    <div className="text-lg font-bold border-b pb-1 mb-2">Données physiques</div>
                                    <p><strong>Poids :</strong> {data.physicalData?.weight != null ? `${data.physicalData.weight} kg` : 'N/A'}</p>
                                    <p><strong>Dimensions :</strong> {data.physicalData?.dimensions || 'N/A'}</p>
                                    <p><strong>Code-barres :</strong> {data.physicalData?.barcode || 'N/A'}</p>
                                </div>
                            )}
                            {data.type === ProductTypeEnum.DIGITAL && (
                                <div>
                                    <div className="text-lg font-bold border-b pb-1 mb-2">Données numériques</div>
                                    <p><strong>URL :</strong> {data.digitalData?.downloadUrl || 'N/A'}</p>
                                    <p><strong>Type MIME :</strong> {data.digitalData?.mimeType || 'N/A'}</p>
                                    <p><strong>Taille :</strong> {data.digitalData?.fileSize != null ? `${data.digitalData.fileSize} octets` : 'N/A'}</p>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-border">
                                <p><strong>Organisation :</strong> {currentOrganization?.name || 'N/A'}</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Le produit sera créé et rattaché à
                            l'organisation <strong>{currentOrganization?.name}</strong>.
                        </p>
                    </div>
                )
            },
        ];

        try {
            await openStepper({
                steps,
                title: "Assistant de Création de produit",
                initialData: {},
                onEnd: async ({data}) => {
                    const created = await StockApiService.createProduct({
                        name: data.name || '',
                        sku: data.sku,
                        description: data.description,
                        type: data.type || ProductTypeEnum.PHYSICAL,
                        isPerishable: data.isPerishable,
                        categoryIds: data.categoryIds,
                        physicalData: data.type === ProductTypeEnum.PHYSICAL ? data.physicalData : undefined,
                        digitalData: data.type === ProductTypeEnum.DIGITAL ? data.digitalData : undefined,
                    });

                    if (!created.data?.data || created.data.error) {
                        throw new Error(created.data?.message || "Une erreur est survenue lors de la création du produit.");
                    }

                    toast.success(`Produit ${data.name || ''} créé avec succès dans l'organisation ${currentOrganization?.name}`);
                }
            });
        } catch (error) {
            console.error('Stepper Error:', error);
            toast.error("Une erreur est survenue lors de la création du produit.");
        }
    };

    return (
        <Fragment>
            <Button onClick={handleOpenStepper} variant="default" size="lg">
                <PlusIcon/>
                Ajouter un produit
            </Button>
        </Fragment>
    );
}
