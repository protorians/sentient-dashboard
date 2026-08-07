"use client";

import React, {useEffect, useState} from "react";
import {LegacySheet} from "@/core/presentation/sheets/legacy-sheet";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {StockInterface} from "@/modules/stock/domain/stock.interface";
import {Badge} from "@/core/presentation/ui/badge";
import {Separator} from "@/core/presentation/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";
import {
    CalendarDaysIcon,
    CheckCircle2Icon,
    ClockIcon,
    PackageIcon,
    ShieldAlertIcon,
    TagsIcon,
    WarehouseIcon,
} from "lucide-react";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {cn} from "@/core/infrastructure/utilities/utils";
import {ProductTypeEnum} from "@/modules/stock/domain/enums/product-type.enum";
import {StockApiService} from "@/modules/stock/application/service/stock-api-service";
import {StockMovementInterface} from "@/modules/stock/domain/stock-movement.interface";
import {StockMovementTypeEnum} from "@/modules/stock/domain/enums/stock-movement-type.enum";
import {Waiting} from "@/core/presentation/waiting";
import {formatQuantity, getStockStatusLabel, isLowStock} from "@/modules/stock/infrastructure/utilities/stock-data.util";

export interface ProductDetailsSheetProps {
    product: ProductInterface;
    children?: React.ReactNode;
    opened?: boolean;
    onOpenChange?: (status: boolean) => void;
}

export function ProductDetailsSheet({children, opened, onOpenChange, product}: ProductDetailsSheetProps) {
    const [stock, setStock] = useState<StockInterface | undefined>(undefined)
    const [stockLoading, setStockLoading] = useState<boolean>(false)
    const [movements, setMovements] = useState<StockMovementInterface[] | undefined>(undefined)
    const [movementsLoading, setMovementsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!opened || !product?.id) return;
        let active = true;

        setStockLoading(true);
        setMovementsLoading(true);

        StockApiService.getProductStock(product.id!)
            .then(response => {
                if (!active) return;
                setStock(response.data?.data || undefined);
            })
            .catch(() => {
                if (!active) return;
                setStock(undefined);
            })
            .finally(() => active && setStockLoading(false));

        StockApiService.getProductMovements(product.id!)
            .then(response => {
                if (!active) return;
                setMovements(response.data?.data || []);
            })
            .catch(() => {
                if (!active) return;
                setMovements([]);
            })
            .finally(() => active && setMovementsLoading(false));

        return () => {
            active = false;
        };
    }, [opened, product?.id]);

    if (!product) return null;

    const formatDate = (date?: Date | string) => {
        if (!date) return "N/A";
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            return format(d, "d MMMM yyyy HH:mm", {locale: fr});
        } catch (e) {
            return "Date invalide";
        }
    };

    const getMovementTypeLabel = (type: StockMovementTypeEnum) => {
        switch (type) {
            case StockMovementTypeEnum.IN:
                return {label: "Entrée", tone: "text-emerald-600" as const};
            case StockMovementTypeEnum.OUT:
                return {label: "Sortie", tone: "text-rose-600" as const};
            case StockMovementTypeEnum.ADJUSTMENT:
                return {label: "Ajustement", tone: "text-amber-600" as const};
            case StockMovementTypeEnum.RETURN:
                return {label: "Retour", tone: "text-blue-600" as const};
            case StockMovementTypeEnum.TRANSFER:
                return {label: "Transfert", tone: "text-purple-600" as const};
            default:
                return {label: type, tone: "text-muted-foreground" as const};
        }
    };

    const isActive = product.status !== false;
    const productWithStock: ProductInterface = {...product, stock: stock};
    const lowStock = isLowStock(productWithStock);

    return (
        <LegacySheet trigger={children} opened={opened} onOpenChange={onOpenChange}>
            <div className="flex flex-col h-full space-y-6 p-6">
                {/* Header Product Section */}
                <div className="flex flex-row items-center space-x-4 pt-4">
                    <div
                        className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <PackageIcon className="size-12"/>
                    </div>
                    <div className="flex flex-col items-start space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
                        <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5">
                            <TagsIcon className="size-3.5"/>
                            {product.sku || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge variant={isActive ? "default" : "secondary"}
                                   className={cn(isActive && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>
                                {isActive
                                    ? (<CheckCircle2Icon className="size-3"/>)
                                    : null}
                                <span className="ml-1">{isActive ? 'Actif' : 'Inactif'}</span>
                            </Badge>
                            {lowStock && (
                                <Badge variant="outline" className="px-1.5 text-rose-600">
                                    <ShieldAlertIcon className="size-3 mr-1"/>
                                    Stock faible
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <Separator/>

                {/* Content Sections */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue="general" className="w-full h-full flex flex-col">
                        <div className="px-1 flex justify-start overflow-y-hidden overflow-x-auto scrollbar-none">
                            <TabsList variant="default" className="">
                                <TabsTrigger value="general"
                                             className="px-4 py-2">
                                    Général
                                </TabsTrigger>
                                <TabsTrigger value="stock"
                                             className="px-4 py-2">
                                    Stock & Mouvements
                                </TabsTrigger>
                                <TabsTrigger value="system"
                                             className="px-4 py-2">
                                    Système
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto mt-4 pr-2 pb-8">
                            <TabsContent value="general" className="mt-0 space-y-6">
                                <Section title="Informations produit">
                                    <InfoRow
                                        icon={<TagsIcon className="size-4"/>}
                                        label="Référence (SKU)"
                                        value={product.sku || undefined}
                                        isCopyable
                                    />
                                    <InfoRow
                                        icon={<PackageIcon className="size-4"/>}
                                        label="Type"
                                        value={product.type === ProductTypeEnum.PHYSICAL ? 'Physique' : 'Numérique'}
                                    />
                                    <InfoRow
                                        icon={<ClockIcon className="size-4"/>}
                                        label="Périssable"
                                        value={product.isPerishable ? 'Oui' : 'Non'}
                                    />
                                </Section>

                                <Section title="Description">
                                    <div className="text-sm text-muted-foreground mt-2">
                                        {product.description || 'Aucune description renseignée.'}
                                    </div>
                                </Section>
                            </TabsContent>

                            <TabsContent value="stock" className="mt-0 space-y-6">
                                <Section title="État du stock">
                                    {stockLoading && (
                                        <Waiting label={"Chargement du stock"}/>
                                    )}
                                    {!stockLoading && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoRow
                                                icon={<WarehouseIcon className="size-4"/>}
                                                label="Quantité en stock"
                                                value={formatQuantity(stock?.quantity)}
                                            />
                                            <InfoRow
                                                icon={<ShieldAlertIcon className="size-4"/>}
                                                label="Seuil d'alerte"
                                                value={formatQuantity(stock?.lowStockThreshold)}
                                            />
                                        </div>
                                    )}
                                    {!stockLoading && (
                                        <Badge variant="outline" className={cn(lowStock ? "text-rose-600" : "text-emerald-600")}>
                                            {getStockStatusLabel(productWithStock)}
                                        </Badge>
                                    )}
                                </Section>

                                <Section title="Historique des mouvements">
                                    {movementsLoading && (
                                        <Waiting label={"Chargement des mouvements"}/>
                                    )}
                                    {!movementsLoading && movements && movements.length === 0 && (
                                        <div
                                            className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed">
                                            <WarehouseIcon className="size-8 text-muted-foreground/30 mb-2"/>
                                            <span
                                                className="text-sm text-muted-foreground italic">Aucun mouvement enregistré</span>
                                        </div>
                                    )}
                                    {!movementsLoading && movements && movements.length > 0 && (
                                        <div className="divide-y divide-border/50 border border-border/50 rounded-lg">
                                            {movements.map((movement) => {
                                                const config = getMovementTypeLabel(movement.type)
                                                return (
                                                    <div key={movement.id ?? movement.createdAt}
                                                         className="flex items-center justify-between py-2.5 px-3">
                                                        <div className="flex flex-col">
                                                            <span className={cn("text-sm font-medium", config.tone)}>
                                                                {config.label}
                                                            </span>
                                                            {movement.reason && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {movement.reason}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-semibold tabular-nums">
                                                                {movement.type === StockMovementTypeEnum.IN || movement.type === StockMovementTypeEnum.RETURN
                                                                    ? '+' : '-'}{formatQuantity(movement.quantity)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(movement.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </Section>
                            </TabsContent>

                            <TabsContent value="system" className="mt-0 space-y-6">
                                <Section title="Informations système">
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoRow
                                            icon={<CalendarDaysIcon className="size-4"/>}
                                            label="Créé le"
                                            value={formatDate(product.createdAt)}
                                        />
                                        <InfoRow
                                            icon={<ClockIcon className="size-4"/>}
                                            label="Dernière modification"
                                            value={formatDate(product.updatedAt)}
                                        />
                                    </div>
                                </Section>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </LegacySheet>
    );
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({title, children}: SectionProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider pl-1">
                {title}
            </h3>
            <div className="bg-muted/20 rounded-lg p-4 space-y-4 border border-border/50">
                {children}
            </div>
        </div>
    );
}

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    isCopyable?: boolean;
    className?: string;
}

function InfoRow({icon, label, value, className}: InfoRowProps) {
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <div
                className="mt-0.5 text-muted-foreground p-1.5 bg-background rounded-md border border-border/50 shadow-xs">
                {icon}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none mb-1">
                    {label}
                </span>
                <span className="text-sm font-medium break-words leading-tight">
                    {value || "Non renseigné"}
                </span>
            </div>
        </div>
    );
}
