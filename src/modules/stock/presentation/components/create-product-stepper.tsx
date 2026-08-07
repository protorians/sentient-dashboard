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
    StoreIcon,
    DollarSignIcon,
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
import {WarehouseInterface} from "@/modules/stock/domain/warehouse.interface";
import {CreateWarehouseInlineButton} from "@/modules/stock/presentation/components/create-warehouse-stepper";
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

function WarehouseSelectContent({value, onValueChange}: {
    value: string;
    onValueChange: (id: string) => void;
}) {
    const {currentOrganization} = useAuth();
    const {data: warehouses, isLoading} = useQuery<WarehouseInterface[]>({
        queryKey: ['stock', 'warehouses', 'select'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const responses = await StockApiService.getWarehouses();
            return responses.data?.data || [];
        },
    });

    if (isLoading) return <Waiting label={"Chargement des emplacements..."}/>;

    if (!warehouses?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed gap-3">
                <StoreIcon className="size-8 text-muted-foreground/30"/>
                <span className="text-sm text-muted-foreground italic">
                    Aucun emplacement disponible. Créez d'abord un emplacement.
                </span>
                <CreateWarehouseInlineButton/>
            </div>
        )
    }

    return (
        <div className="divide-y divide-border/50 border border-border/50 rounded-lg max-h-64 overflow-y-auto">
            {warehouses.map((warehouse) => (
                <div
                    key={warehouse.id}
                    className={`flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-muted/40 transition-colors ${value === warehouse.id ? 'bg-primary/5' : ''}`}
                    onClick={() => onValueChange(warehouse.id)}
                >
                    <Checkbox
                        checked={value === warehouse.id}
                        onCheckedChange={() => onValueChange(warehouse.id)}
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium">{warehouse.name}</span>
                        <span className="text-xs text-muted-foreground">{warehouse.type}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

function SelectedWarehouse({locationId}: { locationId: string }) {
    const {currentOrganization} = useAuth();
    const {data: warehouses} = useQuery<WarehouseInterface[]>({
        queryKey: ['stock', 'warehouses', 'select'],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const responses = await StockApiService.getWarehouses();
            return responses.data?.data || [];
        },
    });

    const warehouse = warehouses?.find(w => w.id === locationId);
    if (!warehouse) return <p>Emplacement non trouvé</p>;
    return <p>{warehouse.name} ({warehouse.type})</p>;
}

export function CreateProductStepper() {
    const {currentOrganization} = useAuth();
    const openStepper = useModalStepper<CreateProductInterface>({
        size: 'XXL'
    });

    const handleOpenStepper = async () => {
        const steps: ModalStepperStep<CreateProductInterface>[] = [
            {
                id: 'location',
                required: true,
                title: 'Emplacement',
                description: 'Emplacement initial pour ce produit',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Emplacement de stock</label>
                            <p className="text-xs text-muted-foreground">
                                Le stock du produit sera initialisé à zéro à cet emplacement.
                            </p>
                        </div>
                        <WarehouseSelectContent
                            value={data.locationId || ''}
                            onValueChange={(locationId) => updateData({locationId})}
                        />
                    </FieldGroup>
                )
            },
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
                id: 'units',
                title: 'Unités de mesure',
                description: 'Unité de base et facteurs de conversion (casier/pack/unité)',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacyInput
                            id="baseUnit"
                            label="Unité de base"
                            description="Nom de l'unité de mesure de base (ex: bouteille, kg, litre)"
                            input={{
                                type: "text",
                                placeholder: "bouteille",
                                value: data.baseUnit || '',
                                onChange: e => updateData({baseUnit: e.target.value}),
                            }}
                            icon={<ScaleIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="unitsPerPack"
                            label="Unités par pack"
                            description="Nombre d'unités de base dans un pack"
                            input={{
                                type: "number",
                                min: 1,
                                placeholder: "6",
                                value: data.unitsPerPack != null ? String(data.unitsPerPack) : '',
                                onChange: e => updateData({unitsPerPack: Number(e.target.value) || undefined}),
                            }}
                            icon={<PackageIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="unitsPerCase"
                            label="Unités par casier"
                            description="Nombre d'unités de base dans un casier"
                            input={{
                                type: "number",
                                min: 1,
                                placeholder: "24",
                                value: data.unitsPerCase != null ? String(data.unitsPerCase) : '',
                                onChange: e => updateData({unitsPerCase: Number(e.target.value) || undefined}),
                            }}
                            icon={<BoxIcon className="size-4 text-muted-foreground/60"/>}
                        />
                    </FieldGroup>
                )
            },
            {
                id: 'pricing',
                title: 'Prix',
                description: 'Prix d\'achat et de revente',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <div className="border-b pb-2 mb-2">
                            <h4 className="text-sm font-semibold">Prix d'achat (coût d'acquisition)</h4>
                        </div>
                        <LegacyInput
                            id="purchasePrice"
                            label="Prix d'achat unitaire"
                            description="Coût d'acquisition d'une unité de base"
                            input={{
                                type: "number",
                                min: 0,
                                placeholder: "1000",
                                value: data.purchasePrice != null ? String(data.purchasePrice) : '',
                                onChange: e => updateData({purchasePrice: Number(e.target.value) || undefined}),
                            }}
                            icon={<DollarSignIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="packPurchasePrice"
                            label="Prix d'achat par pack"
                            description="Optionnel — auto-calculé si vide"
                            input={{
                                type: "number",
                                min: 0,
                                placeholder: "5000",
                                value: data.packPurchasePrice != null ? String(data.packPurchasePrice) : '',
                                onChange: e => updateData({packPurchasePrice: Number(e.target.value) || undefined}),
                            }}
                            icon={<DollarSignIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="casePurchasePrice"
                            label="Prix d'achat par casier"
                            description="Optionnel — auto-calculé si vide"
                            input={{
                                type: "number",
                                min: 0,
                                placeholder: "20000",
                                value: data.casePurchasePrice != null ? String(data.casePurchasePrice) : '',
                                onChange: e => updateData({casePurchasePrice: Number(e.target.value) || undefined}),
                            }}
                            icon={<DollarSignIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <div className="border-b pb-2 mb-2 mt-4">
                            <h4 className="text-sm font-semibold">Prix de revente</h4>
                        </div>
                        <LegacyInput
                            id="salePrice"
                            label="Prix de vente unitaire"
                            description="Prix de revente d'une unité de base"
                            input={{
                                type: "number",
                                min: 0,
                                placeholder: "1500",
                                value: data.salePrice != null ? String(data.salePrice) : '',
                                onChange: e => updateData({salePrice: Number(e.target.value) || undefined}),
                            }}
                            icon={<DollarSignIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="packPrice"
                            label="Prix de vente par pack"
                            description="Optionnel — auto-calculé si vide"
                            input={{
                                type: "number",
                                min: 0,
                                placeholder: "8500",
                                value: data.packPrice != null ? String(data.packPrice) : '',
                                onChange: e => updateData({packPrice: Number(e.target.value) || undefined}),
                            }}
                            icon={<DollarSignIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="casePrice"
                            label="Prix de vente par casier"
                            description="Optionnel — auto-calculé si vide"
                            input={{
                                type: "number",
                                min: 0,
                                placeholder: "32000",
                                value: data.casePrice != null ? String(data.casePrice) : '',
                                onChange: e => updateData({casePrice: Number(e.target.value) || undefined}),
                            }}
                            icon={<DollarSignIcon className="size-4 text-muted-foreground/60"/>}
                        />
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
                                <div className="text-lg font-bold border-b pb-1 mb-2">Emplacement</div>
                                <SelectedWarehouse locationId={data.locationId || ''}/>
                            </div>
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
                            {(data.baseUnit || data.unitsPerPack || data.unitsPerCase) && (
                                <div>
                                    <div className="text-lg font-bold border-b pb-1 mb-2">Unités de mesure</div>
                                    <p><strong>Unité de base :</strong> {data.baseUnit || 'N/A'}</p>
                                    <p><strong>Unités par pack :</strong> {data.unitsPerPack != null ? data.unitsPerPack : 'N/A'}</p>
                                    <p><strong>Unités par casier :</strong> {data.unitsPerCase != null ? data.unitsPerCase : 'N/A'}</p>
                                </div>
                            )}
                            <div>
                                <div className="text-lg font-bold border-b pb-1 mb-2">Prix</div>
                                <p><strong>Prix d'achat unitaire :</strong> {data.purchasePrice != null ? `${data.purchasePrice} FCFA` : 'N/A'}</p>
                                <p><strong>Prix d'achat pack :</strong> {data.packPurchasePrice != null ? `${data.packPurchasePrice} FCFA` : 'Auto-calculé'}</p>
                                <p><strong>Prix d'achat casier :</strong> {data.casePurchasePrice != null ? `${data.casePurchasePrice} FCFA` : 'Auto-calculé'}</p>
                                <p><strong>Prix de vente unitaire :</strong> {data.salePrice != null ? `${data.salePrice} FCFA` : 'N/A'}</p>
                                <p><strong>Prix de vente pack :</strong> {data.packPrice != null ? `${data.packPrice} FCFA` : 'Auto-calculé'}</p>
                                <p><strong>Prix de vente casier :</strong> {data.casePrice != null ? `${data.casePrice} FCFA` : 'Auto-calculé'}</p>
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
                    if (!data.locationId) {
                        throw new Error("Un emplacement est obligatoire. Créez d'abord un emplacement via la gestion des stocks.");
                    }
                    const created = await StockApiService.createProduct({
                        name: data.name || '',
                        sku: data.sku,
                        description: data.description,
                        type: data.type || ProductTypeEnum.PHYSICAL,
                        isPerishable: data.isPerishable,
                        locationId: data.locationId,
                        categoryIds: data.categoryIds,
                        baseUnit: data.baseUnit,
                        unitsPerPack: data.unitsPerPack,
                        unitsPerCase: data.unitsPerCase,
                        purchasePrice: data.purchasePrice,
                        salePrice: data.salePrice,
                        packPrice: data.packPrice,
                        casePrice: data.casePrice,
                        packPurchasePrice: data.packPurchasePrice,
                        casePurchasePrice: data.casePurchasePrice,
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
