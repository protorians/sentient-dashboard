"use client"

import React, {useState} from "react";
import {OrderInterface, UpdateOrderInterface} from "@/modules/beverage-sales/domain/order.interface";
import {OrderStatusEnum} from "@/modules/beverage-sales/domain/enums/order-status.enum";
import {OrderTypeEnum} from "@/modules/beverage-sales/domain/enums/order-type.enum";
import {ProductInterface} from "@/modules/stock/domain/product.interface";
import {BundleInterface} from "@/modules/beverage-sales/domain/bundle.interface";
import {Button} from "@/core/presentation/ui/button";
import {Badge} from "@/core/presentation/ui/badge";
import {WaitingActivity} from "@/core/presentation/waiting-activity";
import {OrderEditDialog} from "@/modules/beverage-sales/presentation/components/order-edit-dialog";
import {
    PlusIcon,
    CheckCircle2Icon,
    XCircleIcon,
    PencilIcon,
    ClockIcon,
    ReceiptTextIcon,
} from "lucide-react";
import {cn} from "@/core/infrastructure/utilities/utils";
import {formatPrice} from "@/modules/beverage-sales/presentation/utilities/beverage-sales.util";

interface OrdersListProps {
    orders?: OrderInterface[];
    isLoading?: boolean;
    activeOrder?: OrderInterface | null;
    onSelectOrder: (order: OrderInterface) => void;
    onCreatePending: () => void;
    isCreatingPending: boolean;
    onMarkPaid: (id: string) => void;
    onCancelOrder: (id: string) => void;
    onDelete: (id: string) => void;
    onSaveOrder: (order: OrderInterface, payload: UpdateOrderInterface) => void;
    isSaving: boolean;
    products?: ProductInterface[];
    bundles?: BundleInterface[];
}

const getOrderTypeLabel = (type: OrderTypeEnum) => {
    switch (type) {
        case OrderTypeEnum.GROS: return 'Gros';
        case OrderTypeEnum.SEMI_GROS: return 'Semi-gros';
        case OrderTypeEnum.DETAIL: return 'Détail';
    }
};

const StatusBadge = ({status}: { status: OrderStatusEnum }) => {
    if (status === OrderStatusEnum.PAID) {
        return (
            <Badge className="gap-1 text-[10px] rounded-full bg-green-500/10 text-green-600 border-none px-2.5">
                <CheckCircle2Icon className="size-3"/>Payée
            </Badge>
        );
    }
    if (status === OrderStatusEnum.CANCELLED) {
        return (
            <Badge className="gap-1 text-[10px] rounded-full bg-red-500/10 text-red-500 border-none px-2.5">
                <XCircleIcon className="size-3"/>Annulée
            </Badge>
        );
    }
    return (
        <Badge className="gap-1 text-[10px] rounded-full bg-amber-500/10 text-amber-600 border-none px-2.5">
            <ClockIcon className="size-3"/>En attente
        </Badge>
    );
};

export function OrdersList({
    orders,
    isLoading,
    activeOrder,
    onSelectOrder,
    onCreatePending,
    isCreatingPending,
    onMarkPaid,
    onCancelOrder,
    onSaveOrder,
    isSaving,
    products,
    bundles,
}: OrdersListProps) {
    const [editing, setEditing] = useState<OrderInterface | null>(null);
    const activeOrders = (orders ?? []).filter(o => o.status !== OrderStatusEnum.CANCELLED);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Liste des commandes</h3>
                <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={onCreatePending}
                    disabled={isCreatingPending}
                >
                    {isCreatingPending ? <WaitingActivity size={14}/> : <PlusIcon className="size-4"/>}
                    Nouvelle commande
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-6">
                    <WaitingActivity size={20}/>
                </div>
            ) : activeOrders.length === 0 ? (
                <div className="flex items-center gap-3 text-muted-foreground bg-card rounded-2xl border border-border/40 px-5 py-4">
                    <ReceiptTextIcon className="size-5 opacity-40"/>
                    <p className="text-sm">Aucune commande — créez-en une avec « Nouvelle commande »</p>
                </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {activeOrders.map(order => {
                        const isActive = activeOrder?.id === order.id;
                        const isPending = order.status === OrderStatusEnum.PENDING;
                        const table = order.table;
                        const linesCount = order.items.length + order.bundles.length;
                        return (
                            <div
                                key={order.id}
                                className={cn(
                                    "group relative flex flex-col gap-1.5 min-w-[190px] p-4 rounded-2xl bg-card border border-border/40 cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm",
                                    isActive && "border-primary/60 bg-primary/5 shadow-sm"
                                )}
                                onClick={() => onSelectOrder(order)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm font-bold truncate">{order.orderNumber}</span>
                                    <span className="text-sm font-bold text-primary whitespace-nowrap">{formatPrice(order.netAmount)}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {linesCount} article{linesCount > 1 ? 's' : ''}
                                    {table ? ` • ${table.label}` : ''}
                                    {` • ${getOrderTypeLabel(order.orderType)}`}
                                </span>
                                <div className="flex items-center justify-between mt-1">
                                    <StatusBadge status={order.status}/>
                                    {isPending && (
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="size-6 text-muted-foreground hover:text-primary"
                                                onClick={(e) => handleAction(e, () => setEditing(order))}
                                                title="Modifier"
                                            >
                                                <PencilIcon className="size-3"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="size-6 text-muted-foreground hover:text-green-600"
                                                onClick={(e) => handleAction(e, () => onMarkPaid(order.id))}
                                                title="Marquer payé"
                                            >
                                                <CheckCircle2Icon className="size-3"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="size-6 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => handleAction(e, () => onCancelOrder(order.id))}
                                                title="Annuler"
                                            >
                                                <XCircleIcon className="size-3"/>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <OrderEditDialog
                order={editing}
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                products={products}
                bundles={bundles}
                isSaving={isSaving}
                onSave={(order, payload) => onSaveOrder(order, payload)}
            />
        </div>
    );
}
